package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.ContentEntryTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentEntryTopicRepository extends JpaRepository<ContentEntryTopic, Long> {
    List<ContentEntryTopic> findByContentEntryId(Long contentEntryId);
    
    List<ContentEntryTopic> findByTopicId(Long topicId);
    
    void deleteByContentEntryId(Long contentEntryId);
    
    @Query("SELECT cet.topic.topic FROM ContentEntryTopic cet WHERE cet.contentEntry.id = :contentEntryId")
    List<String> findTopicNamesByContentEntryId(@Param("contentEntryId") Long contentEntryId);
}