package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    // Find all questions for a content entry
    List<Question> findByContentEntryId(Long contentEntryId);
    
    // Delete all questions for a content entry
    void deleteByContentEntryId(Long contentEntryId);
}