package ai.snippetquiz.core_service.shared.domain.valueobject;

import java.util.UUID;

public class UserId extends BaseId<UUID> {
    public UserId(UUID value) {
        super(value);
    }
    public static UserId map(String value) {
        return new UserId(UUID.fromString(value));
    }
}
