package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.YoutubeChannelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaYoutubeChannelRepository extends JpaRepository<YoutubeChannelEntity, Long> {
    
    Optional<YoutubeChannelEntity> findByChannelId(String channelId);
}