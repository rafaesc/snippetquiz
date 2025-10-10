package ai.snippetquiz.core_service.question.adapter.out.repository;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaQuestionOptionRepository extends JpaRepository<QuestionOptionEntity, Long> {
}