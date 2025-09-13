package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_generation_instructions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizGenerationInstruction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instruction", nullable = false, columnDefinition = "TEXT")
    private String instruction;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public QuizGenerationInstruction(String instruction, UUID userId) {
        this.instruction = instruction;
        this.userId = userId;
    }
}