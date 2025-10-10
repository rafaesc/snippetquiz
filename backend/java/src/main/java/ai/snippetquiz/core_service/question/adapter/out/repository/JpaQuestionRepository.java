package ai.snippetquiz.core_service.question.adapter.out.repository;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaQuestionRepository extends JpaRepository<QuestionEntity, Long> {
    List<QuestionEntity> findByContentEntryId(Long contentEntryId);
}