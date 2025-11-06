package ai.snippetquiz.core_service.shared.adapter.out.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_store")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DomainEventEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID userId;

    private UUID aggregateId;

    private String aggregateType;

    private String eventId;

    private String payload;

    private int version;

    private LocalDateTime occurredOn;
}
