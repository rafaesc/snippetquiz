package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryTopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaContentEntryTopicRepository extends JpaRepository<ContentEntryTopicEntity, Long> {
    List<ContentEntryTopicEntity> findByContentEntryId(Long contentEntryId);

    List<ContentEntryTopicEntity> findByTopicId(Long topicId);

    List<ContentEntryTopicEntity> findByContentEntryIdIn(List<Long> contentEntryIds);

    void deleteByContentEntryId(Long contentEntryId);
}