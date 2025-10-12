package ai.snippetquiz.core_service.quiz.adapter.out.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_question_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionOptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_question_id", nullable = false)
    private Long quizQuestionId;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "option_explanation", nullable = false, columnDefinition = "TEXT")
    private String optionExplanation;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    public QuizQuestionOptionEntity(Long quizQuestionId, String optionText, String optionExplanation, Boolean isCorrect) {
        this.quizQuestionId = quizQuestionId;
        this.optionText = optionText;
        this.optionExplanation = optionExplanation;
        this.isCorrect = isCorrect;
    }
}