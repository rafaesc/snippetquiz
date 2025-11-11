package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.events.QuizAnswerMarkedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizCreatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizQuestionsAddedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizStatusUpdatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.valueobject.ContentEntryCount;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import static java.util.Arrays.asList;


@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Quiz extends AggregateRoot<QuizId> {
    private UserId userId;
    private ContentBankId contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;
    private ContentEntryCount contentEntriesCount;
    private Set<String> quizTopics;
    private Boolean isAllQuestionsMarked;
    private LocalDateTime questionUpdatedAt;
    private List<QuizQuestion> quizQuestions;
    private List<QuizQuestionResponse>  quizQuestionResponses;

    public Quiz(QuizId quizId, UserId userId, ContentBankId contentBankId, String bankName) {
        var now = LocalDateTime.now();

        record(new QuizCreatedDomainEvent(
                quizId.toString(),
                userId,
                contentBankId.getValue().toString(),
                bankName,
                QuizStatus.PREPARE,
                now));
    }

    public void apply(QuizCreatedDomainEvent event) {
        setId(QuizId.map(event.getAggregateId()));
        this.userId = UserId.map(event.getUserId());
        this.contentBankId = ContentBankId.map(event.getContentBankId());
        this.contentEntriesCount = new ContentEntryCount(0);
        this.bankName = event.getBankName();
        this.createdAt = event.getCreatedAt();
        this.quizQuestionResponses = new ArrayList<>();
        this.quizQuestions = new ArrayList<>();
        this.status = event.getStatus();
    }

    public void delete() {
        record(new QuizDeletedDomainEvent(getId().toString(), userId));
    }

    public void apply(QuizDeletedDomainEvent event) {
        deactivate();
    }

    public void updateStatus(QuizStatus newStatus) {
        record(new QuizStatusUpdatedDomainEvent(getId().toString(), userId, newStatus));
    }

    public void apply(QuizStatusUpdatedDomainEvent event) {
        this.status = event.getStatus();
    }

    public void addQuestions(
        QuizStatus status, 
        Integer contentEntriesCount, 
        Set<String> quizTopics,
        List<QuizQuestion> quizQuestions
    ) {
        record(new QuizQuestionsAddedDomainEvent(
                getId().toString(),
                userId,
                quizTopics,
                status,
                LocalDateTime.now(),
                new ContentEntryCount(contentEntriesCount),
                quizQuestions));
    }

    public void apply(QuizQuestionsAddedDomainEvent event) {
        this.status = event.getStatus();
        this.quizTopics = event.getQuizTopics();
        this.contentEntriesCount = event.getContentEntriesCount();
        this.quizQuestions.addAll(event.getQuizQuestions());
        this.questionUpdatedAt = event.getUpdatedAt();
    }

    public void answerMarked(QuizQuestionResponse quizQuestionResponse) {
        if (Objects.nonNull(this.isAllQuestionsMarked)) {
            return;
        }

        var willBeAllQuestionsMarked = (getQuizQuestionResponses().size() + 1) >= getQuizQuestions().size() &&
                asList(QuizStatus.READY, QuizStatus.READY_WITH_ERROR).contains(getStatus());

        record(new QuizAnswerMarkedDomainEvent(
                getId().toString(), userId, quizQuestionResponse, willBeAllQuestionsMarked));
    }

    public void apply(QuizAnswerMarkedDomainEvent event) {
        this.quizQuestionResponses.add(event.getQuizQuestionResponse());
        this.isAllQuestionsMarked = event.isAllQuestionsMarked();
    }
}