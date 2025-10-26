package ai.snippetquiz.core_service.contentbank.application;

import java.time.LocalDateTime;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ContentBankResponse implements Response {
    private final String id;
    private final String name;
    private final String userId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final Integer entryCount;
}
