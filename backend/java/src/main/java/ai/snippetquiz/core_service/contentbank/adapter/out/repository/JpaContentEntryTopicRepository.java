package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryTopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaContentEntryTopicRepository extends JpaRepository<ContentEntryTopicEntity, Long> {
    List<ContentEntryTopicEntity> findByContentEntryId(UUID contentEntryId);

    List<ContentEntryTopicEntity> findByTopicId(Long topicId);

    List<ContentEntryTopicEntity> findByContentEntryIdIn(List<UUID> contentEntryIds);

    void deleteByContentEntryId(UUID contentEntryId);
}
