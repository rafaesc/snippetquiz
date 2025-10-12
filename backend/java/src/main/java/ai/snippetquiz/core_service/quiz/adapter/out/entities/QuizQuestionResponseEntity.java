package ai.snippetquiz.core_service.quiz.adapter.out.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "quiz_question_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne
    @JoinColumn(name = "quiz_question_id", nullable = false)
    private QuizQuestionEntity quizQuestion;

    @ManyToOne
    @JoinColumn(name = "quiz_question_option_id", nullable = false)
    private QuizQuestionOptionEntity quizQuestionOption;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer;

    @Column(name = "response_time", nullable = false)
    private String responseTime;

    public QuizQuestionResponseEntity(Long quizId, UUID userId, QuizQuestionEntity quizQuestion, QuizQuestionOptionEntity quizQuestionOption,
                                      Boolean isCorrect, String correctAnswer, String responseTime) {
        this.quizId = quizId;
        this.userId = userId;
        this.quizQuestion = quizQuestion;
        this.quizQuestionOption = quizQuestionOption;
        this.isCorrect = isCorrect;
        this.correctAnswer = correctAnswer;
        this.responseTime = responseTime;
    }
}