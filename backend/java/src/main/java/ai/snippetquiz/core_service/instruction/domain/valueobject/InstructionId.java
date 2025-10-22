package ai.snippetquiz.core_service.instruction.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

import java.util.UUID;

public class InstructionId extends BaseId<UUID> {
    public InstructionId(UUID value) {
        super(value);
    }
}
