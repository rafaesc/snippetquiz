package ai.snippetquiz.core_service.quiz.adapter.out.entities;

import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bank_id")
    private Long contentBankId;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private QuizStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "content_entries_count", nullable = false)
    private Integer contentEntriesCount = 0;

    @Column(name = "questions_count", nullable = false)
    private Integer questionsCount = 0;

    @Column(name = "questions_completed", nullable = false)
    private Integer questionsCompleted = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "question_updated_at")
    private LocalDateTime questionUpdatedAt;

    @Column(name = "user_id")
    private UUID userId;

    @OneToMany(mappedBy = "quizId", cascade = CascadeType.ALL)
    private List<QuizTopicEntity> quizTopics;

    @OneToMany(mappedBy = "quizId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionEntity> quizQuestions;

    public QuizEntity(Long contentBankId, String bankName, QuizStatus status, UUID userId) {
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.userId = userId;
    }
}