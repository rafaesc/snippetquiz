package ai.snippetquiz.core_service.contentbank.application.contentbank.find;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class FindContentBankQuery implements Query {
    private final UUID userId;
    private final UUID id;
}
