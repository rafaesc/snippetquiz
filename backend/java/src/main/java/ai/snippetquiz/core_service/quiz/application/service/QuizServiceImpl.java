package ai.snippetquiz.core_service.quiz.application.service;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.instruction.domain.port.QuizGenerationInstructionRepository;
import ai.snippetquiz.core_service.question.domain.port.QuestionRepository;
import ai.snippetquiz.core_service.quiz.application.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.quiz.application.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.GetContentEntriesResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizInProgressDetails;
import ai.snippetquiz.core_service.quiz.application.response.QuizQuestionDTOResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizQuestionOptionDTOResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponseItemDto;
import ai.snippetquiz.core_service.quiz.application.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.quiz.application.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizProjectionRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.service.EventSourcingHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.ConflictException;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static ai.snippetquiz.core_service.shared.domain.Utils.paginateList;
import static java.util.Objects.isNull;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class QuizServiceImpl implements QuizService {
    private final ContentBankRepository contentBankRepository;
    private final ContentEntryRepository contentEntryRepository;
    private final QuizGenerationInstructionRepository quizGenerationInstructionRepository;
    private final QuestionRepository questionRepository;
    private final ContentEntryTopicRepository contentEntryTopicRepository;
    private final TopicRepository topicRepository;
    private final EventSourcingHandler<Quiz, QuizId> quizEventSourcingHandler;
    private final QuizProjectionRepository quizProjectionRepository;

    private String getFinalStatus(QuizStatus quizStatus, LocalDateTime questionUpdatedAt) {
        String finalStatus = quizStatus.getValue();
        if (QuizStatus.IN_PROGRESS.getValue().equals(finalStatus) && questionUpdatedAt != null) {
            var thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);
            if (questionUpdatedAt.isBefore(thirtyMinutesAgo)) {
                finalStatus = QuizStatus.READY_WITH_ERROR.getValue();
            }
        }
        return finalStatus;
    }

    @Transactional(readOnly = true)
    public PagedModelResponse<QuizResponse> findAll(UserId userId, Pageable pageable) {
        var quizPage = quizProjectionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        var quizResponses = quizPage.map(quiz -> new QuizResponse(
                quiz.getId().toString(),
                quiz.getBankName(),
                quiz.getCreatedAt(),
                quiz.getQuestionsCount(),
                quiz.getQuestionsCompleted(),
                getFinalStatus(quiz.getStatus(), quiz.getQuestionUpdatedAt()),
                quiz.getContentEntriesCount(),
                Objects.nonNull(quiz.getTopics()) ? new ArrayList<>(quiz.getTopics()): new ArrayList<>()));
        return new PagedModelResponse<>(quizResponses);
    }

    @Transactional(readOnly = true)
    public FindOneQuizResponse findOne(UserId userId, QuizId quizId) {
        var quiz = quizEventSourcingHandler.getById(userId, quizId)
                .orElseThrow(() -> new NotFoundException("Quiz not found " + quizId.toString()));

        Set<String> topics = quiz.getQuizTopics();
        var totalQuestionCompleted = quiz.getQuizQuestionResponses().size();
        var totalQuestions = quiz.getQuizQuestions().size();

        if (totalQuestions == 0) {
            return new FindOneQuizResponse(
                    quiz.getId().toString(),
                    quiz.getBankName(),
                    quiz.getCreatedAt(),
                    totalQuestions,
                    totalQuestionCompleted,
                    getFinalStatus(quiz.getStatus(), quiz.getQuestionUpdatedAt()),
                    quiz.getContentEntriesCount().getValue(),
                    topics,
                    null);
        }

        QuizQuestionDTOResponse currentQuestionDto = null;
        if (totalQuestionCompleted < totalQuestions) {
            var currentQuestion = quiz.getQuizQuestions().get(totalQuestionCompleted);
            var options = currentQuestion.getQuizQuestionOptions().stream()
                    .map(option -> new QuizQuestionOptionDTOResponse(
                            option.getId().toString(),
                            option.getOptionText()))
                    .toList();

            currentQuestionDto = new QuizQuestionDTOResponse(
                    currentQuestion.getId().toString(),
                    currentQuestion.getQuestion(),
                    options);
        }

        return new FindOneQuizResponse(
                quiz.getId().toString(),
                quiz.getBankName(),
                quiz.getCreatedAt(),
                totalQuestions,
                totalQuestionCompleted,
                getFinalStatus(quiz.getStatus(), quiz.getQuestionUpdatedAt()),
                quiz.getContentEntriesCount().getValue(),
                topics,
                currentQuestionDto);
    }

    @Transactional(readOnly = true)
    public PagedModelResponse<QuizResponseItemDto> findQuizResponses(UserId userId, QuizId quizId, Pageable pageable) {
        var quiz = quizEventSourcingHandler.getById(userId, quizId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));
        var questionsByQuestionId = quiz.getQuizQuestions().stream()
                .collect(Collectors.toMap(QuizQuestion::getId, Function.identity()));

        // projection
        var responsePage = paginateList(pageable, quiz.getQuizQuestionResponses());

        var formattedResponses = responsePage.map(response -> {
            var question = questionsByQuestionId.get(response.getQuizQuestion());

            if (Objects.isNull(question)) {
                throw new NotFoundException("Quiz question not found " + quizId);
            }

            var selectedOption = question.getQuizQuestionOptions().stream().filter(
                    option -> response.getQuizQuestionOption().equals(option.getId())
            ).findFirst();

            if (selectedOption.isEmpty()) {
                throw new NotFoundException("Quiz question option not found " + quizId);
            }

            return new QuizResponseItemDto(
                    response.getIsCorrect(),
                    question.getQuestion(),
                    selectedOption.get().getOptionText(),
                    response.getCorrectAnswer(),
                    selectedOption.get().getOptionExplanation(),
                    question.getContentEntrySourceUrl());
        });

        return new PagedModelResponse<>(formattedResponses);
    }

    @Transactional(readOnly = true)
    public QuizSummaryResponseDto findQuizSummary(QuizId quizId, UserId userId) {
        var quiz = quizEventSourcingHandler.getById(userId, quizId)
                .orElseThrow(() -> new NotFoundException("Quiz not found " + quizId));

        Set<String> topics = quiz.getQuizTopics();

        var totalCorrectAnswers = quiz.getQuizQuestionResponses().stream().filter(QuizQuestionResponse::getIsCorrect).count();

        return new QuizSummaryResponseDto(
                topics,
                quiz.getQuizQuestions().size(),
                totalCorrectAnswers);
    }

    private GetContentEntriesResponse getContentEntriesByBankId(ContentBankId bankId, UserId userId) {
        try {
            contentBankRepository.findByIdAndUserId(bankId, userId)
                    .orElseThrow(() -> new RuntimeException(
                            "Content bank not found or access denied for user " + userId));

            log.info("Content bank {} validated for user {}", bankId, userId);

            var contentEntries = contentEntryRepository.findAllByContentBankId(bankId);

            log.info("Found {} content entries for bankId: {}", contentEntries.size(), bankId);

            if (contentEntries.isEmpty()) {
                log.warn("No content entries found for bankId: {}", bankId);
            }

            var entriesToGenerate = new ArrayList<ContentEntryId>();
            var entriesSkipped = 0;

            for (var entry : contentEntries) {
                if (entry.getQuestionsGenerated() != null && entry.getQuestionsGenerated()) {
                    entriesSkipped++;
                    continue;
                }
                entriesToGenerate.add(entry.getId());
            }

            var instruction = quizGenerationInstructionRepository
                    .findFirstByUserId(userId).orElse(null);

            var request = new GetContentEntriesResponse.GenerateQuizRequest(
                    instruction != null ? instruction.getInstruction() : "",
                    entriesToGenerate);

            return new GetContentEntriesResponse(request, entriesSkipped);
        } catch (Exception error) {
            log.error("Failed to fetch content entries for bankId: {}", bankId, error);
            throw error;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CheckQuizInProgressResponse checkQuizInProgress(UserId userId) {
        var inProgressQuizzes = quizProjectionRepository.findAllByUserIdAndStatus(userId,
                QuizStatus.IN_PROGRESS);

        if (inProgressQuizzes.isEmpty()) {
            return new CheckQuizInProgressResponse(false, null);
        }

        QuizInProgressDetails inProgressQuiz = null;

        for (var quizProjection : inProgressQuizzes) {
            var finalStatus = getFinalStatus(quizProjection.getStatus(), quizProjection.getQuestionUpdatedAt());

            if (QuizStatus.PREPARE.equals(quizProjection.getStatus()) || QuizStatus.IN_PROGRESS.getValue().equals(finalStatus)) {
                inProgressQuiz = new QuizInProgressDetails(
                        quizProjection.getId().toString(),
                        quizProjection.getContentBankId() != null ? quizProjection.getContentBankId().toString() : null,
                        quizProjection.getBankName());
            }

            if (QuizStatus.READY_WITH_ERROR.getValue().equals(finalStatus)) {
                var quiz = quizEventSourcingHandler.getById(userId, quizProjection.getId())
                        .orElseThrow(() -> new NotFoundException("Quiz not found " + quizProjection.getId()));
                quiz.updateStatus(QuizStatus.READY_WITH_ERROR);
                quizEventSourcingHandler.save(quiz);
            }
        }

        return new CheckQuizInProgressResponse(Objects.nonNull(inProgressQuiz), inProgressQuiz);
    }

    @Override
    public void delete(UserId userId, QuizId quizId) {
        var quiz = quizEventSourcingHandler.getById(userId, quizId)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));

        quiz.delete();
    }

    @Override
    @Transactional
    public void createQuiz(UserId userId, ContentBankId contentBankId, QuizId quizId) {
        var checkQuizInProgressResponse = checkQuizInProgress(userId);
        if (checkQuizInProgressResponse.getInProgress()) {
            throw new ConflictException("Quiz in progress");
        }

        var contentBank = contentBankRepository
                .findByIdAndUserIdWithContentEntries(contentBankId, userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or you do not have permission to access it"));

        quizEventSourcingHandler.getById(userId, quizId)
                .ifPresent(quiz -> {
                    throw new ConflictException("Quiz already exists");
                });

        var contentEntriesResponse = getContentEntriesByBankId(
                contentBank.getId(), userId);
        var quizRequest = contentEntriesResponse.request();
        var entries = quizRequest.newContentEntries();
        var isReady = (isNull(entries) || entries.isEmpty());

        var quiz = new Quiz(quizId, userId, contentBank.getId(), contentBank.getName(),
                quizRequest.instructions(), entries,
                contentEntriesResponse.entriesSkipped());

        createQuizQuestions(quiz, isReady ? QuizStatus.READY : QuizStatus.PREPARE);

        if (isReady) {
            log.warn("No content entries found for quizId: {}, bankId: {}, userId: {}", quiz.getId(),
                    contentBank.getId(), userId);
        }
    }

    @Override
    @Transactional
    public void processNewQuizQuestions(Quiz quiz, QuizStatus status) {
        createQuizQuestions(quiz, status);
    }

    private void createQuizQuestions(Quiz quiz, QuizStatus status) {
        var contentBankId = quiz.getContentBankId();
        var contentEntryList = contentEntryRepository.findAllByContentBankId(contentBankId);
        Map<ContentEntryId, ContentEntry> contentEntryMap = contentEntryList.stream()
                .collect(toMap(
                        ContentEntry::getId,
                        Function.identity()));

        var allQuestions = questionRepository.findByContentEntryIdIn(contentEntryList.stream()
                .map(ContentEntry::getId).toList());

        if (allQuestions.isEmpty()) {
            quizEventSourcingHandler.save(quiz);
            return;
        }

        var mapQuizQuestionByChunk = quiz.getQuizQuestions()
                .stream()
                .collect(Collectors.groupingBy(
                        QuizQuestion::getChunkIndex,
                        toMap(
                                QuizQuestion::getQuestionIndexInChunk,
                                q -> Map.of(q.getContentEntryId(), q),
                                (existing, replacement) -> existing)));

        var contentEntryTopics = contentEntryTopicRepository.findByContentEntryIdIn(contentEntryList.stream()
                .map(ContentEntry::getId).toList());

        List<QuizQuestion> quizQuestions = new ArrayList<>(allQuestions.size());
        for (var question : allQuestions) {
            var contentEntryId = question.getContentEntryId();
            var contentEntry = contentEntryMap.get(contentEntryId);
            var chunkIndex = question.getChunkIndex();
            var questionIndexInChunk = question.getQuestionIndexInChunk();

            if (mapQuizQuestionByChunk.containsKey(chunkIndex)
                    && mapQuizQuestionByChunk.get(chunkIndex).containsKey(questionIndexInChunk)
                    && mapQuizQuestionByChunk.get(chunkIndex).get(questionIndexInChunk)
                    .containsKey(contentEntryId)) {
                continue;
            }

            var quizQuestion = new QuizQuestion();
            quizQuestion.setChunkIndex(chunkIndex);
            quizQuestion.setQuestionIndexInChunk(questionIndexInChunk);
            quizQuestion.setQuestion(question.getQuestion());
            quizQuestion.setType(question.getType());
            quizQuestion.setContentEntryType(
                    contentEntry != null ? contentEntry.getContentType() : ContentType.SELECTED_TEXT);
            quizQuestion.setContentEntrySourceUrl(contentEntry != null ? contentEntry.getSourceUrl() : null);
            quizQuestion.setContentEntryId(contentEntryId);

            for (var option : question.getQuestionOptions()) {
                var quizOption = new QuizQuestionOption();
                quizOption.setOptionText(option.getOptionText());
                quizOption.setOptionExplanation(option.getOptionExplanation());
                quizOption.setIsCorrect(option.getIsCorrect());

                quizQuestion.getQuizQuestionOptions().add(quizOption);
            }

            quizQuestions.add(quizQuestion);
        }

        Set<String> quizTopics = topicRepository
                .findByUserIdAndIdIn(quiz.getUserId(),
                        contentEntryTopics.stream().map(ContentEntryTopic::getTopicId).toList())
                .stream()
                .map(Topic::getTopic)
                .collect(toSet());

        quiz.addQuestions(status, contentEntryList.size(), quizTopics, quizQuestions);

        quizEventSourcingHandler.save(quiz);
    }

    @Override
    public UpdateQuizResponse updateQuiz(UserId userId, QuizId quizId, QuizQuestionOptionId optionSelectedId) {
        var quiz = quizEventSourcingHandler.getById(userId, quizId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));
        var questionsCompleted = quiz.getQuizQuestionResponses().size();

        if (questionsCompleted >= quiz.getQuizQuestions().size()) {
            return new UpdateQuizResponse(
                    "Quiz is already completed",
                    false,
                    true,
                    null);
        }

        var currentQuestion = quiz.getQuizQuestions().get(questionsCompleted);

        if (isNull(currentQuestion)) {
            return new UpdateQuizResponse(
                    "No more questions available",
                    false,
                    false,
                    null);
        }

        var options = currentQuestion.getQuizQuestionOptions();
        var selectedOption = options.stream()
                .filter(option -> option.getId().equals(optionSelectedId))
                .findFirst()
                .orElse(null);

        if (isNull(selectedOption)) {
            return new UpdateQuizResponse(
                    "Invalid question option selected",
                    false,
                    false,
                    null);
        }

        var correctOption = options.stream()
                .filter(QuizQuestionOption::getIsCorrect)
                .findFirst()
                .orElse(null);

        if (isNull(correctOption)) {
            log.error("No correct option found for question {}", currentQuestion.getId());
            return new UpdateQuizResponse(
                    "Question configuration error",
                    false,
                    false,
                    null);
        }

        // Create a new QuizQuestionResponse
        var response = new QuizQuestionResponse();
        response.setQuizQuestion(currentQuestion.getId());
        response.setQuizQuestionOption(selectedOption.getId());
        response.setIsCorrect(selectedOption.getIsCorrect());
        response.setCorrectAnswer(correctOption.getOptionText());
        response.setResponseTime("0");

        quiz.answerMarked(response);

        quizEventSourcingHandler.save(quiz);

        return new UpdateQuizResponse(
                "Quiz updated successfully",
                true,
                quiz.getIsAllQuestionsMarked(),
                correctOption.getId().toString());
    }
}
