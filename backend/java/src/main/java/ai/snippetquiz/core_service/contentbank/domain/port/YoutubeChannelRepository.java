package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import ai.snippetquiz.core_service.contentbank.domain.model.YoutubeChannel;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.YoutubeChannelId;

public interface YoutubeChannelRepository {
    Optional<YoutubeChannel> findByChannelId(String channelId);
    
    Optional<YoutubeChannel> findById(YoutubeChannelId id);

    List<YoutubeChannel> findAllByIds(Set<YoutubeChannelId> ids);
    
    YoutubeChannel save(YoutubeChannel youtubeChannel);
}
