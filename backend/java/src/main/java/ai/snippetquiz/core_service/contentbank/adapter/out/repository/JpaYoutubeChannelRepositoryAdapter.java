package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.YoutubeChannelEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.YoutubeChannelMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.YoutubeChannel;
import ai.snippetquiz.core_service.contentbank.domain.port.out.YoutubeChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaYoutubeChannelRepositoryAdapter implements YoutubeChannelRepository {
    private final JpaYoutubeChannelRepository jpaYoutubeChannelRepository;
    private final YoutubeChannelMapper youtubeChannelMapper;

    @Override
    public Optional<YoutubeChannel> findByChannelId(String channelId) {
        return jpaYoutubeChannelRepository.findByChannelId(channelId)
                .map(youtubeChannelMapper::toDomain);
    }

    @Override
    public Optional<YoutubeChannel> findById(Long id) {
        return jpaYoutubeChannelRepository.findById(id)
                .map(youtubeChannelMapper::toDomain);
    }

    @Override
    public YoutubeChannel save(YoutubeChannel youtubeChannel) {
        YoutubeChannelEntity entity = youtubeChannelMapper.toEntity(youtubeChannel);
        YoutubeChannelEntity saved = jpaYoutubeChannelRepository.save(entity);
        return youtubeChannelMapper.toDomain(saved);
    }
}