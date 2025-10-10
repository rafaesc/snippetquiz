package ai.snippetquiz.core_service.question.domain.port;

import ai.snippetquiz.core_service.question.domain.Question;

import java.util.List;

public interface QuestionRepository  {
    Question save(Question question);
    List<Question> findByContentEntryId(Long contentEntryId);
}
