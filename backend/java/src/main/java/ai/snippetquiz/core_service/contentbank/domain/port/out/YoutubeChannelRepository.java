package ai.snippetquiz.core_service.contentbank.domain.port.out;

import java.util.Optional;

import ai.snippetquiz.core_service.contentbank.domain.model.YoutubeChannel;

public interface YoutubeChannelRepository {
    Optional<YoutubeChannel> findByChannelId(String channelId);
    
    Optional<YoutubeChannel> findById(Long id);
    
    YoutubeChannel save(YoutubeChannel youtubeChannel);
}
