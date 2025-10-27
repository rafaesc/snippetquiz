package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    private QuizId id;
    private ContentBankId contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;
    private Integer contentEntriesCount = 0;
    private Integer questionsCount = 0;
    private Integer questionsCompleted = 0;
    private LocalDateTime completedAt;
    private LocalDateTime questionUpdatedAt;
    private UserId userId;
    private List<QuizTopic> quizTopics = List.of();

    public static Quiz create(UserId userId, ContentBankId contentBankId, String bankName) {
        Quiz quiz = new Quiz();
        quiz.setUserId(userId);
        quiz.setContentBankId(contentBankId);
        quiz.setBankName(bankName);
        quiz.setContentEntriesCount(0);
        quiz.setQuestionsCount(0);
        quiz.setQuestionsCompleted(0);

        return quiz;
    }
}