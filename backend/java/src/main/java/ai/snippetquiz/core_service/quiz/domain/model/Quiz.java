package ai.snippetquiz.core_service.quiz.domain.model;

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
    private Long contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;
    private Integer contentEntriesCount = 0;
    private Integer questionsCount = 0;
    private Integer questionsCompleted = 0;
    private LocalDateTime completedAt;
    private LocalDateTime questionUpdatedAt;
    private UUID userId;
    private List<QuizTopic> quizTopics;
    private List<QuizQuestion> quizQuestions;
    private List<QuizQuestionResponse> quizQuestionResponses;

    public Quiz(Long contentBankId, String bankName, QuizStatus status, UUID userId) {
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.userId = userId;
    }
}