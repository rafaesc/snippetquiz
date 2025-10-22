package ai.snippetquiz.core_service.instruction.application.find;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class FindInstructionQuery implements Query {
    private final UUID userId;
}
