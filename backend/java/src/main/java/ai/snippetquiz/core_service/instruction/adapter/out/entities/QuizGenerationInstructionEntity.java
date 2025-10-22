package ai.snippetquiz.core_service.instruction.adapter.out.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_generation_instructions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizGenerationInstructionEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "instruction", nullable = false, columnDefinition = "TEXT")
    private String instruction;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public QuizGenerationInstructionEntity(String instruction, UUID userId) {
        this.instruction = instruction;
        this.userId = userId;
    }
}