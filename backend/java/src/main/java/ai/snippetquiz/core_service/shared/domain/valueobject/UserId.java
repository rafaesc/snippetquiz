package ai.snippetquiz.core_service.shared.domain.valueobject;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.UUID;

@JsonSerialize
public class UserId extends BaseId<UUID> {
    @JsonCreator
    public UserId(@JsonProperty("value") UUID value) {
        super(value);
    }
    public static UserId map(String value) {
        return new UserId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return getValue().toString();
    }
}
