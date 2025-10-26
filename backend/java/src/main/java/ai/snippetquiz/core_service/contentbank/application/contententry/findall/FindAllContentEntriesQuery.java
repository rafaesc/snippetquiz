package ai.snippetquiz.core_service.contentbank.application.contententry.findall;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class FindAllContentEntriesQuery implements Query {
    private final UUID userId;
    private final UUID bankId;
    private final String name;
    private final Pageable pageable;
}