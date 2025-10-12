package ai.snippetquiz.core_service.question.application;

import ai.snippetquiz.core_service.question.application.dto.CreateQuestionRequest;
import ai.snippetquiz.core_service.question.application.dto.QuestionOptionRequest;
import ai.snippetquiz.core_service.question.domain.Question;
import ai.snippetquiz.core_service.question.domain.QuestionOption;
import ai.snippetquiz.core_service.question.domain.port.QuestionOptionRepository;
import ai.snippetquiz.core_service.question.domain.port.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createQuestion(CreateQuestionRequest request, UUID userId) {
        var contentEntryId = request.contentEntryId();
        var questionText = request.question();
        var options = request.options();
        var chunkIndex = request.currentChunkIndex();
        var questionIndexInChunk = request.questionIndexInChunk();

        var question = new Question();
        question.setQuestion(questionText);
        question.setType("single_choice");
        question.setChunkIndex(chunkIndex);
        question.setQuestionIndexInChunk(questionIndexInChunk);
        question.setContentEntryId(contentEntryId);

        var savedQuestion = questionRepository.save(question);
        var quizQuestionOptions = new ArrayList<QuestionOption>();

        for (QuestionOptionRequest optionRequest : options) {
            QuestionOption option = new QuestionOption();
            option.setQuestion(savedQuestion);
            option.setOptionText(optionRequest.optionText());
            option.setOptionExplanation(optionRequest.optionExplanation());
            option.setIsCorrect(optionRequest.isCorrect());

            quizQuestionOptions.add(questionOptionRepository.save(option));
        }

        savedQuestion.setQuestionOptions(quizQuestionOptions);
    }
}
