package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_question_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_question_id", nullable = false)
    private QuizQuestion quizQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_question_option_id", nullable = false)
    private QuizQuestionOption quizQuestionOption;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer;

    @Column(name = "response_time", nullable = false)
    private String responseTime;

    public QuizQuestionResponse(Quiz quiz, QuizQuestion quizQuestion, QuizQuestionOption quizQuestionOption, 
                               Boolean isCorrect, String correctAnswer, String responseTime) {
        this.quiz = quiz;
        this.quizQuestion = quizQuestion;
        this.quizQuestionOption = quizQuestionOption;
        this.isCorrect = isCorrect;
        this.correctAnswer = correctAnswer;
        this.responseTime = responseTime;
    }
}