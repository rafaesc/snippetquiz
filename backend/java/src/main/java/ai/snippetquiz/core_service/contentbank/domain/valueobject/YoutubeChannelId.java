package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize
public class YoutubeChannelId extends BaseId<Long> {
    @JsonCreator
    public YoutubeChannelId(@JsonProperty("value") Long value) {
        super(value);
    }
    public static YoutubeChannelId map(Long value) {
        return new YoutubeChannelId(value);
    }
}