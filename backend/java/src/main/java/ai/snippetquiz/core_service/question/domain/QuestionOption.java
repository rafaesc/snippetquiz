package ai.snippetquiz.core_service.question.domain;

import ai.snippetquiz.core_service.question.domain.valueobject.QuestionOptionId;
import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOption extends BaseEntity<QuestionOptionId> {
    private Question question;
    private String optionText;
    private String optionExplanation;
    private Boolean isCorrect = false;
}