package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    
    // Find all options for a question
    List<QuestionOption> findByQuestionId(Long questionId);
    
    // Delete all options for a question
    void deleteByQuestionId(Long questionId);
}