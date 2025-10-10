package ai.snippetquiz.core_service.question.adapter.out.entities;

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
@Table(name = "question_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionEntity question;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "option_explanation", nullable = false, columnDefinition = "TEXT")
    private String optionExplanation;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    public QuestionOptionEntity(QuestionEntity question, String optionText, String optionExplanation, Boolean isCorrect) {
        this.question = question;
        this.optionText = optionText;
        this.optionExplanation = optionExplanation;
        this.isCorrect = isCorrect;
    }
}