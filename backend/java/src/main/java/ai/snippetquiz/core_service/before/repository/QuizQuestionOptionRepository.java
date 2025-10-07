package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.QuizQuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizQuestionOptionRepository extends JpaRepository<QuizQuestionOption, Long> {
}