package ai.snippetquiz.core_service.instruction.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import ai.snippetquiz.core_service.instruction.domain.valueobject.InstructionId;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class QuizGenerationInstruction extends AggregateRoot<InstructionId> {
    private String instruction;
    private UUID userId;
    private LocalDateTime updatedAt;
}
