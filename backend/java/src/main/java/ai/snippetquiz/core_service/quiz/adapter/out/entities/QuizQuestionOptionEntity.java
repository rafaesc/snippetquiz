package ai.snippetquiz.core_service.quiz.adapter.out.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "quiz_question_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionOptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_question_id", nullable = false)
    private QuizQuestionEntity quizQuestion;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "option_explanation", nullable = false, columnDefinition = "TEXT")
    private String optionExplanation;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    @OneToMany(mappedBy = "quizQuestionOption", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionResponseEntity> quizQuestionResponses;

    public QuizQuestionOptionEntity(QuizQuestionEntity quizQuestion, String optionText, String optionExplanation, Boolean isCorrect) {
        this.quizQuestion = quizQuestion;
        this.optionText = optionText;
        this.optionExplanation = optionExplanation;
        this.isCorrect = isCorrect;
    }
}