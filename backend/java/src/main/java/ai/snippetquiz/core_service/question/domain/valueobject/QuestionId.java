package ai.snippetquiz.core_service.question.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

import java.util.UUID;

public class QuestionId extends BaseId<UUID> {
    public QuestionId(UUID value) {
        super(value);
    }
}