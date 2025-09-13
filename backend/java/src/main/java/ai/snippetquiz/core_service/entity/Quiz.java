package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
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
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id")
    private ContentBank contentBank;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "status")
    private String status;

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

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizTopic> quizTopics;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestion> quizQuestions;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionResponse> quizQuestionResponses;

    public Quiz(ContentBank contentBank, String bankName, String status, UUID userId) {
        this.contentBank = contentBank;
        this.bankName = bankName;
        this.status = status;
        this.userId = userId;
    }
}