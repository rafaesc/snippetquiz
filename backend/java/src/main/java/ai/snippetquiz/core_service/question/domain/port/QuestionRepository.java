package ai.snippetquiz.core_service.question.domain.port;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.domain.Question;

import java.util.List;

public interface QuestionRepository  {
    Question save(Question question);
    List<Question> findByContentEntryId(ContentEntryId contentEntryId);
    List<Question> findByContentEntryIdIn(List<ContentEntryId> contentEntryIds);
}
