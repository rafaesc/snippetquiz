package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.domain.Question;
import ai.snippetquiz.core_service.quiz.domain.events.QuizCreatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizQuestionGeneratedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.valueobject.ContentEntryCount;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Quiz extends AggregateRoot<QuizId> {
    private UserId userId;
    private ContentBankId contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;
    private ContentEntryCount contentEntriesCount;
    private LocalDateTime questionUpdatedAt;
    private List<QuizTopic> quizTopics;

    public Quiz(QuizId quizId, UserId userId, ContentBankId contentBankId, String bankName) {
        var now = LocalDateTime.now();

        record(new QuizCreatedDomainEvent(
                quizId.getValue().toString(),
                userId.getValue().toString(),
                contentBankId.getValue().toString(),
                bankName,
                Utils.dateToString(now),
                0,
                0,
                0,
                QuizStatus.PREPARE));
    }

    public  void apply(QuizCreatedDomainEvent event ) {
        setId(QuizId.map(event.getAggregateId()));
        setUserId(UserId.map(event.getUserId()));
        setContentBankId(ContentBankId.map(event.getContentBankId()));
        setBankName(event.getBankName());
        setCreatedAt(Utils.stringToDate(event.getCreatedAt()));
        setContentEntriesCount(new ContentEntryCount(event.getContentEntriesCount()));
        setStatus(event.getStatus());
    }

    public void delete() {
        record(new QuizDeletedDomainEvent(
            getId().getValue().toString(),
            userId.getValue().toString()));
    }

    public void apply(QuizDeletedDomainEvent event) {
        deactivate();
    }

    public void generateQuestions(List<Question> questions) {
        record(new QuizQuestionGeneratedDomainEvent(
                getId().getValue().toString(),
                questions));
    }
}