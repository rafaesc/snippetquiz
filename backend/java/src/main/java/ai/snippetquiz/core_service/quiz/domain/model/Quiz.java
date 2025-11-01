package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.events.QuizCreatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
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
    private Integer contentEntriesCount = 0;
    private Integer questionsCount = 0;
    private Integer questionsCompleted = 0;
    private LocalDateTime completedAt;
    private LocalDateTime questionUpdatedAt;
    private List<QuizTopic> quizTopics = List.of();

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
                QuizStatus.READY));
    }

    public  void apply(QuizCreatedDomainEvent event ) {
        setId(QuizId.map(event.getAggregateId()));
        setUserId(UserId.map(event.getUserId()));
        setContentBankId(ContentBankId.map(event.getContentBankId()));
        setBankName(event.getBankName());
        setCreatedAt(Utils.stringToDate(event.getCreatedAt()));
        setContentEntriesCount(event.getContentEntriesCount());
        setQuestionsCount(event.getQuestionsCount());
        setQuestionsCompleted(event.getQuestionsCompleted());
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
}