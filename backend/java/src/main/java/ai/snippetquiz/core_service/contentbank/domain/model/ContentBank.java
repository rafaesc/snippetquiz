package ai.snippetquiz.core_service.contentbank.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentBank {
    private Long id;
    private UUID userId;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContentEntry> contentEntries = List.of();
}
