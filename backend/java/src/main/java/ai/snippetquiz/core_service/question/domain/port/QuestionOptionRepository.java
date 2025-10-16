package ai.snippetquiz.core_service.question.domain.port;


import ai.snippetquiz.core_service.question.domain.QuestionOption;

import java.util.List;

public interface QuestionOptionRepository {
    List<QuestionOption> saveAll(List<QuestionOption> questionOptions);
}