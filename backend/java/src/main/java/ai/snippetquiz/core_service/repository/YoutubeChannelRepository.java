package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.YoutubeChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface YoutubeChannelRepository extends JpaRepository<YoutubeChannel, Long> {
    
    // Find by channel ID
    Optional<YoutubeChannel> findByChannelId(String channelId);
}