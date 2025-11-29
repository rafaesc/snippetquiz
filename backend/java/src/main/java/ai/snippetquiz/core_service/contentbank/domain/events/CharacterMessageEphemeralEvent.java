package ai.snippetquiz.core_service.contentbank.domain.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.EphemeralEvent;
import lombok.Getter;

import java.util.HashMap;
import java.util.UUID;

@Getter
public class CharacterMessageEphemeralEvent extends EphemeralEvent {
    private final String characterMessage;
    private final String characterSpriteURL;
    private final Integer characterAnimateTo;
    private final Integer characterAnimateSeconds;

    public CharacterMessageEphemeralEvent(
            UUID aggregateId,
            UUID userId,
            String characterMessage,
            String characterSpriteURL,
            Integer characterAnimateTo,
            Integer characterAnimateSeconds) {
        super(aggregateId, userId);
        this.characterMessage = characterMessage;
        this.characterSpriteURL = characterSpriteURL;
        this.characterAnimateTo = characterAnimateTo;
        this.characterAnimateSeconds = characterAnimateSeconds;
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        HashMap<String, Object> primitives = new HashMap<>();
        primitives.put("characterMessage", this.characterMessage);
        primitives.put("characterSpriteURL", this.characterSpriteURL);
        primitives.put("characterAnimateTo", this.characterAnimateTo);
        primitives.put("characterAnimateSeconds", this.characterAnimateSeconds);
        return primitives;
    }

    public static String eventName() {
        return "character.message.ephemeral";
    }
}
