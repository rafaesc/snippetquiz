package ai.snippetquiz.core_service.contentbank.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class YoutubeChannel {
    private Long id;
    private String channelId;
    private String channelName;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public YoutubeChannel(String channelId, String channelName, String avatarUrl) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.avatarUrl = avatarUrl;
    }
}
