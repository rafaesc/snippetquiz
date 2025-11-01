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
import ai.snippetquiz.core_service.quiz.domain.events.CreateQuizGenerationEventPayload;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.model.QuizTopic;
import ai.snippetquiz.core_service.quiz.domain.port.messaging.CreateQuizEventPublisher;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizQuestionOptionRepository;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizQuestionRepository;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizQuestionResponseRepository;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizRepository;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizTopicRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.ConflictException;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;
import static java.util.stream.Collectors.toMap;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class QuizServiceImpl implements QuizService {
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizQuestionResponseRepository quizQuestionResponseRepository;
    private final ContentBankRepository contentBankRepository;
    private final ContentEntryRepository contentEntryRepository;
    private final QuizQuestionOptionRepository quizQuestionOptionRepository;
    private final QuizGenerationInstructionRepository quizGenerationInstructionRepository;
    private final QuizTopicRepository quizTopicRepository;
    private final QuestionRepository questionRepository;
    private final ContentEntryTopicRepository contentEntryTopicRepository;
    private final TopicRepository topicRepository;
    private final CreateQuizEventPublisher createQuizEventPublisher;

    private final Pageable quizQuestionPageable = PageRequest.of(0, Integer.MAX_VALUE,
            Sort.by(Sort.Direction.ASC, "id"));

    private String getFinalStatus(Quiz quiz) {
        String finalStatus = quiz.getStatus().getValue();
        if (QuizStatus.IN_PROGRESS.getValue().equals(finalStatus) && quiz.getQuestionUpdatedAt() != null) {
            LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);
            if (quiz.getQuestionUpdatedAt().isBefore(thirtyMinutesAgo)) {
                finalStatus = QuizStatus.READY_WITH_ERROR.getValue();
            }
        }
        return finalStatus;
    }

    @Transactional(readOnly = true)
    public PagedModelResponse<QuizResponse> findAll(UserId userId, Pageable pageable) {
        var quizPage = quizRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        var quizResponses = quizPage.map(quiz -> {
            List<String> topics = Objects.nonNull(quiz.getQuizTopics()) ? quiz.getQuizTopics().stream()
                    .map(QuizTopic::getTopicName)
                    .toList() : List.of();
            return new QuizResponse(
                    quiz.getId().toString(),
                    quiz.getBankName(),
                    quiz.getCreatedAt(),
                    quiz.getQuestionsCount(),
                    quiz.getQuestionsCompleted(),
                    getFinalStatus(quiz),
                    quiz.getContentEntriesCount(),
                    topics);
        });
        return new PagedModelResponse<>(quizResponses);
    }

    @Transactional(readOnly = true)
    public FindOneQuizResponse findOne(UserId userId, QuizId quizId) {
        var quiz = quizRepository.findByIdAndUserIdWithTopics(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found " + quizId));

        List<String> topics = quiz.getQuizTopics() != null ? quiz.getQuizTopics().stream()
                .map(QuizTopic::getTopicName).toList() : List.of();

        var sortedQuestions = quizQuestionRepository.findByQuizId(quizId, quizQuestionPageable);
        if (sortedQuestions.isEmpty()) {
            return new FindOneQuizResponse(
                    quiz.getId().toString(),
                    quiz.getBankName(),
                    quiz.getCreatedAt(),
                    quiz.getQuestionsCount(),
                    quiz.getQuestionsCompleted(),
                    getFinalStatus(quiz),
                    quiz.getContentEntriesCount(),
                    topics,
                    null);
        }

        QuizQuestionDTOResponse currentQuestionDto = null;
        if (quiz.getQuestionsCompleted() < sortedQuestions.size()) {
            var currentQuestion = sortedQuestions.get(quiz.getQuestionsCompleted());
            var options = quizQuestionOptionRepository.findByQuizQuestionId(currentQuestion.getId()).stream()
                    .map(option -> new QuizQuestionOptionDTOResponse(
                            option.getId(),
                            option.getOptionText()))
                    .toList();

            currentQuestionDto = new QuizQuestionDTOResponse(
                    currentQuestion.getId(),
                    currentQuestion.getQuestion(),
                    options);
        }

        return new FindOneQuizResponse(
                quiz.getId().toString(),
                quiz.getBankName(),
                quiz.getCreatedAt(),
                quiz.getQuestionsCount(),
                quiz.getQuestionsCompleted(),
                getFinalStatus(quiz),
                quiz.getContentEntriesCount(),
                topics,
                currentQuestionDto);
    }

    @Transactional(readOnly = true)
    public PagedModelResponse<QuizResponseItemDto> findQuizResponses(UserId userId, QuizId quizId, Pageable pageable) {

        quizRepository.findByIdAndUserId(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        var responsePage = quizQuestionResponseRepository.findByQuiz_IdAndQuiz_UserId(quizId, userId, pageable);

        var formattedResponses = responsePage.map(response -> {
            var question = response.getQuizQuestion();
            var selectedOption = response.getQuizQuestionOption();

            return new QuizResponseItemDto(
                    response.getIsCorrect(),
                    question != null ? question.getQuestion() : "",
                    selectedOption != null ? selectedOption.getOptionText() : "",
                    response.getCorrectAnswer(),
                    selectedOption != null ? selectedOption.getOptionExplanation() : "",
                    question != null ? question.getContentEntrySourceUrl() : "");
        });

        return new PagedModelResponse<>(formattedResponses);
    }

    @Transactional(readOnly = true)
    public QuizSummaryResponseDto findQuizSummary(QuizId quizId, UserId userId) {
        var quiz = quizRepository.findByIdAndUserIdWithTopics(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        List<String> topics = quiz.getQuizTopics() != null ? quiz.getQuizTopics().stream()
                .map(QuizTopic::getTopicName)
                .toList() : List.of();

        var totalCorrectAnswers = quizQuestionResponseRepository.countByQuizIdAndIsCorrect(quizId, true);

        return new QuizSummaryResponseDto(
                topics,
                quiz.getQuestionsCount(),
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

            var entriesToGenerate = new ArrayList<GetContentEntriesResponse.ContentEntryDto>();
            var entriesSkipped = 0;

            for (var entry : contentEntries) {
                if (entry.getQuestionsGenerated() != null && entry.getQuestionsGenerated()) {
                    entriesSkipped++;
                    continue;
                }
                entriesToGenerate.add(new GetContentEntriesResponse.ContentEntryDto(
                        entry.getId().toString(),
                        entry.getPageTitle() != null ? entry.getPageTitle() : "",
                        entry.getContent() != null ? entry.getContent() : "",
                        entry.getWordCount() != null ? entry.getWordCount() : 0));
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
        var inProgressQuizzes = quizRepository.findAllByUserIdAndStatus(userId,
                QuizStatus.IN_PROGRESS);

        if (inProgressQuizzes.isEmpty()) {
            return new CheckQuizInProgressResponse(false, null);
        }

        QuizInProgressDetails inProgressQuiz = null;

        for (var quiz : inProgressQuizzes) {
            var finalStatus = getFinalStatus(quiz);

            if (QuizStatus.PREPARE.equals(quiz.getStatus()) || QuizStatus.IN_PROGRESS.getValue().equals(finalStatus)) {
                inProgressQuiz = new QuizInProgressDetails(
                        quiz.getId().toString(),
                        quiz.getContentBankId() != null ? quiz.getContentBankId().toString() : null,
                        quiz.getBankName());
            }

            if (QuizStatus.READY_WITH_ERROR.getValue().equals(finalStatus)) {
                quiz.setStatus(QuizStatus.READY_WITH_ERROR);
                quizRepository.save(quiz);
            }
        }

        return new CheckQuizInProgressResponse(Objects.nonNull(inProgressQuiz), inProgressQuiz);
    }

    public void remove(UserId userId, QuizId quizId) {
        var quiz = quizRepository.findByIdAndUserId(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));

        quiz.delete();
        quizRepository.delete(quiz);
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

        quizRepository.findById(quizId)
                .ifPresent(quiz -> {
                    throw new ConflictException("Quiz already exists");
                });

        var quiz = new Quiz(quizId, userId, contentBank.getId(), contentBank.getName());
        quiz = quizRepository.save(quiz);

        var contentEntriesResponse = getContentEntriesByBankId(
                contentBank.getId(), userId);
        var quizRequest = contentEntriesResponse.request();
        var entries = quizRequest.contentEntries();
        var isReady = (isNull(entries) || entries.isEmpty());
        createQuizQuestions(quiz, isReady ? QuizStatus.READY : QuizStatus.PREPARE);

        if (isReady) {
            log.warn("No content entries found for quizId: {}, bankId: {}, userId: {}", quiz.getId(),
                    contentBank.getId(), userId);
        }

        emitCreateQuizEvent(userId, quiz.getId(), contentBank.getId(), contentEntriesResponse);
    }

    @Override
    @Transactional
    public void processNewQuizQuestions(Quiz quiz, QuizStatus status) {
        createQuizQuestions(quiz, status);
    }

    @Override
    public void createQuizQuestions(Quiz quiz, QuizStatus status) {
        var contentBankId = quiz.getContentBankId();
        var contentEntryList = contentEntryRepository.findAllByContentBankId(contentBankId);
        Map<ContentEntryId, ContentEntry> contentEntryMap = contentEntryList.stream()
                .collect(toMap(
                        ContentEntry::getId,
                        Function.identity()));

        var allQuestions = questionRepository.findByContentEntryIdIn(contentEntryList.stream()
                .map(ContentEntry::getId).toList());

        if (allQuestions.isEmpty()) {
            return;
        }

        Map<Integer, Map<Integer, Map<ContentEntryId, QuizQuestion>>> mapQuizQuestionByChunk = quizQuestionRepository
                .findByQuizId(quiz.getId()).stream()
                .filter(q -> q.getChunkIndex() != null && q.getQuestionIndexInChunk() != null)
                .collect(Collectors.groupingBy(
                        QuizQuestion::getChunkIndex,
                        toMap(
                                QuizQuestion::getQuestionIndexInChunk,
                                q -> Map.of(q.getContentEntryId(), q),
                                (existing, replacement) -> existing)));

        var contentEntryTopics = contentEntryTopicRepository.findByContentEntryIdIn(contentEntryList.stream()
                .map(ContentEntry::getId).toList());
        var allTopics = topicRepository
                .findByUserIdAndIdIn(quiz.getUserId(),
                        contentEntryTopics.stream().map(ContentEntryTopic::getTopicId).toList())
                .stream()
                .map(Topic::getTopic)
                .toList();

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
            quizQuestion.setQuizId(quiz.getId());

            quizQuestion = quizQuestionRepository.save(quizQuestion);

            for (var option : question.getQuestionOptions()) {
                var quizOption = new QuizQuestionOption();
                quizOption.setQuizQuestionId(quizQuestion.getId());
                quizOption.setOptionText(option.getOptionText());
                quizOption.setOptionExplanation(option.getOptionExplanation());
                quizOption.setIsCorrect(option.getIsCorrect());

                quizQuestionOptionRepository.save(quizOption);
            }
        }

        for (var topicName : allTopics) {
            var existingTopic = quizTopicRepository
                    .findByQuizIdAndTopicName(quiz.getId(), topicName);

            if (existingTopic.isEmpty()) {
                var quizTopic = new QuizTopic();
                quizTopic.setQuizId(quiz.getId());
                quizTopic.setTopicName(topicName);
                quizTopicRepository.save(quizTopic);
            }
        }

        quiz.setContentEntriesCount(contentEntryList.size());
        quiz.setQuestionsCount(quizQuestionRepository.findByQuizId(quiz.getId()).size());
        quiz.setQuestionUpdatedAt(LocalDateTime.now());
        quizRepository.save(quiz);

    }

    @Override
    public UpdateQuizResponse updateQuiz(UserId userId, QuizId quizId, Long optionSelectedId) {
        var quiz = quizRepository.findByIdAndUserIdWithQuestions(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        if (quiz.getQuestionsCompleted() >= quiz.getQuestionsCount()) {
            return new UpdateQuizResponse(
                    "Quiz is already completed",
                    false,
                    false,
                    null);
        }

        var sortedQuestions = quizQuestionRepository.findByQuizId(quizId, quizQuestionPageable);

        if (quiz.getQuestionsCompleted() >= sortedQuestions.size()) {
            return new UpdateQuizResponse(
                    "Quiz is already completed",
                    false,
                    false,
                    null);
        }

        var currentQuestion = sortedQuestions.get(quiz.getQuestionsCompleted());

        if (isNull(currentQuestion)) {
            return new UpdateQuizResponse(
                    "No more questions available",
                    false,
                    false,
                    null);
        }

        var options = quizQuestionOptionRepository.findByQuizQuestionId(currentQuestion.getId());
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
        response.setUserId(userId);
        response.setQuizId(quiz.getId());
        response.setQuizQuestion(currentQuestion);
        response.setQuizQuestionOption(selectedOption);
        response.setIsCorrect(selectedOption.getIsCorrect());
        response.setCorrectAnswer(correctOption.getOptionText());
        response.setResponseTime("0");

        quizQuestionResponseRepository.save(response);

        // Increment Quiz.questionsCompleted
        var updatedQuestionsCompleted = quiz.getQuestionsCompleted() + 1;
        var isCompleted = updatedQuestionsCompleted >= quiz.getQuestionsCount() &&
                QuizStatus.READY.equals(quiz.getStatus());

        quiz.setQuestionsCompleted(updatedQuestionsCompleted);
        if (isCompleted) {
            quiz.setCompletedAt(LocalDateTime.now());
        }

        quizRepository.save(quiz);

        return new UpdateQuizResponse(
                "Quiz updated successfully",
                true,
                isCompleted,
                correctOption.getId());
    }

    private void emitCreateQuizEvent(UserId userId, QuizId quizId, ContentBankId bankId,
            GetContentEntriesResponse contentEntriesResponse) {
        try {
            var quizRequest = contentEntriesResponse.request();
            var entriesSkipped = contentEntriesResponse.entriesSkipped();
            var entries = quizRequest.contentEntries();

            var payload = new CreateQuizGenerationEventPayload(
                    quizRequest.instructions(),
                    entries.stream()
                            .map(entry -> new CreateQuizGenerationEventPayload.ContentEntryEvent(
                                    entry.id(),
                                    entry.pageTitle(),
                                    entry.content(),
                                    entry.wordCountAnalyzed()))
                            .toList(),
                    entriesSkipped,
                    quizId.getValue().toString(),
                    userId.getValue().toString(),
                    bankId.getValue());

            createQuizEventPublisher.emitCreateQuizEvent(
                    payload,
                    userId,
                    quizId,
                    bankId,
                    entriesSkipped);

            log.info("Create quiz event emitted for quizId: {}, bankId: {}, userId: {}", quizId, bankId, userId);
        } catch (Exception error) {
            log.error("Failed to emit create quiz event for quizId: {}, bankId: {}, userId: {}",
                    quizId, bankId, userId, error);
            throw new RuntimeException("Failed to emit create quiz event", error);
        }
    }
}
