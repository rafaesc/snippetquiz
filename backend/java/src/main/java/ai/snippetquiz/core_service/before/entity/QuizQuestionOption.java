package ai.snippetquiz.core_service.before.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "quiz_question_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_question_id", nullable = false)
    private QuizQuestion quizQuestion;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "option_explanation", nullable = false, columnDefinition = "TEXT")
    private String optionExplanation;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    @OneToMany(mappedBy = "quizQuestionOption", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionResponse> quizQuestionResponses;

    public QuizQuestionOption(QuizQuestion quizQuestion, String optionText, String optionExplanation, Boolean isCorrect) {
        this.quizQuestion = quizQuestion;
        this.optionText = optionText;
        this.optionExplanation = optionExplanation;
        this.isCorrect = isCorrect;
    }
}