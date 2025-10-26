package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    private Long id;
    private ContentBankId contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;
    private Integer contentEntriesCount = 0;
    private Integer questionsCount = 0;
    private Integer questionsCompleted = 0;
    private LocalDateTime completedAt;
    private LocalDateTime questionUpdatedAt;
    private UUID userId;
    private List<QuizTopic> quizTopics = List.of();

    public Quiz(ContentBankId contentBankId, String bankName, QuizStatus status, UUID userId) {
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.userId = userId;
    }
}