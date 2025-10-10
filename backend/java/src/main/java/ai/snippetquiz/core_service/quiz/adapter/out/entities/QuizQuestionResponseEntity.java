package ai.snippetquiz.core_service.quiz.adapter.out.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_question_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private QuizEntity quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_question_id", nullable = false)
    private QuizQuestionEntity quizQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_question_option_id", nullable = false)
    private QuizQuestionOptionEntity quizQuestionOption;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer;

    @Column(name = "response_time", nullable = false)
    private String responseTime;

    public QuizQuestionResponseEntity(QuizEntity quiz, QuizQuestionEntity quizQuestion, QuizQuestionOptionEntity quizQuestionOption,
                                      Boolean isCorrect, String correctAnswer, String responseTime) {
        this.quiz = quiz;
        this.quizQuestion = quizQuestion;
        this.quizQuestionOption = quizQuestionOption;
        this.isCorrect = isCorrect;
        this.correctAnswer = correctAnswer;
        this.responseTime = responseTime;
    }
}