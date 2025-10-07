package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.YoutubeChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface YoutubeChannelRepository extends JpaRepository<YoutubeChannel, Long> {
    Optional<YoutubeChannel> findByChannelId(String channelId);
}