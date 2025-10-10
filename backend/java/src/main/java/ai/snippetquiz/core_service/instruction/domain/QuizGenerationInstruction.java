package ai.snippetquiz.core_service.instruction.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizGenerationInstruction {
    private Long id;
    private String instruction;
    private UUID userId;
    private LocalDateTime updatedAt;
}
