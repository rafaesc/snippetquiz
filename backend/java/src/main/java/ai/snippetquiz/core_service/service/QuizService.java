package ai.snippetquiz.core_service.service;

import ai.snippetquiz.core_service.dto.request.ContentEntryDto;
import ai.snippetquiz.core_service.dto.request.CreateQuestionRequest;
import ai.snippetquiz.core_service.dto.request.CreateQuizDTO;
import ai.snippetquiz.core_service.dto.request.GenerateQuizRequest;
import ai.snippetquiz.core_service.dto.request.QuestionOptionRequest;
import ai.snippetquiz.core_service.dto.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.dto.response.CreateQuestionResponse;
import ai.snippetquiz.core_service.dto.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.dto.response.GetContentEntriesResponse;
import ai.snippetquiz.core_service.dto.response.QuizInProgressDetails;
import ai.snippetquiz.core_service.dto.response.QuizQuestionDTOResponse;
import ai.snippetquiz.core_service.dto.response.QuizQuestionOptionDTOResponse;
import ai.snippetquiz.core_service.dto.response.QuizResponse;
import ai.snippetquiz.core_service.dto.response.QuizResponseItemDto;
import ai.snippetquiz.core_service.dto.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.dto.response.UpdateQuizDateResponse;
import ai.snippetquiz.core_service.dto.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.entity.ContentType;
import ai.snippetquiz.core_service.entity.Question;
import ai.snippetquiz.core_service.entity.QuestionOption;
import ai.snippetquiz.core_service.entity.Quiz;
import ai.snippetquiz.core_service.entity.QuizQuestion;
import ai.snippetquiz.core_service.entity.QuizQuestionOption;
import ai.snippetquiz.core_service.entity.QuizQuestionResponse;
import ai.snippetquiz.core_service.entity.QuizStatus;
import ai.snippetquiz.core_service.entity.QuizTopic;
import ai.snippetquiz.core_service.entity.Topic;
import ai.snippetquiz.core_service.exception.NotFoundException;
import ai.snippetquiz.core_service.repository.ContentBankRepository;
import ai.snippetquiz.core_service.repository.ContentEntryRepository;
import ai.snippetquiz.core_service.repository.QuestionOptionRepository;
import ai.snippetquiz.core_service.repository.QuestionRepository;
import ai.snippetquiz.core_service.repository.QuizGenerationInstructionRepository;
import ai.snippetquiz.core_service.repository.QuizQuestionOptionRepository;
import ai.snippetquiz.core_service.repository.QuizQuestionRepository;
import ai.snippetquiz.core_service.repository.QuizQuestionResponseRepository;
import ai.snippetquiz.core_service.repository.QuizRepository;
import ai.snippetquiz.core_service.repository.QuizTopicRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import static java.util.Objects.isNull;

@Service
@AllArgsConstructor
@Transactional
@Slf4j
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizQuestionResponseRepository quizQuestionResponseRepository;
    private final ContentBankRepository contentBankRepository;
    private final ContentEntryRepository contentEntryRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuizQuestionOptionRepository quizQuestionOptionRepository;
    private final QuizGenerationInstructionRepository quizGenerationInstructionRepository;
    private final QuizTopicRepository quizTopicRepository;
    private final KafkaProducerService kafkaProducerService;

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
    public PagedModel<QuizResponse> findAll(UUID userId, Pageable pageable) {
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

        return new PagedModel<>(quizResponses);
    }

    @Transactional(readOnly = true)
    public FindOneQuizResponse findOne(UUID userId, String id) {
        Long quizId = Long.parseLong(id);
        Quiz quiz = quizRepository.findByIdAndUserIdWithTopics(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found " + quizId));

        List<String> topics = quiz.getQuizTopics() != null ? quiz.getQuizTopics().stream()
                .map(QuizTopic::getTopicName)
                .collect(Collectors.toList()) : List.of();

        var questions = quizQuestionRepository.findByQuizIdWithOptions(quizId);
        if (questions.isEmpty()) {
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
        if (quiz.getQuestionsCompleted() < questions.size()) {
            var currentQuestion = questions.get(quiz.getQuestionsCompleted());
            var options = currentQuestion.getQuizQuestionOptions().stream()
                    .map(option -> new QuizQuestionOptionDTOResponse(
                            option.getId().toString(),
                            option.getOptionText(),
                            option.getOptionExplanation(),
                            option.getIsCorrect()))
                    .collect(Collectors.toList());

            currentQuestionDto = new QuizQuestionDTOResponse(
                    currentQuestion.getId().toString(),
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
    public PagedModel<QuizResponseItemDto> findQuizResponses(UUID userId, String quizIdString, Pageable pageable) {
        var quizId = Long.valueOf(quizIdString);

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

        return new PagedModel<>(formattedResponses);
    }

    @Transactional(readOnly = true)
    public QuizSummaryResponseDto findQuizSummary(Long id, UUID userId) {
        var quiz = quizRepository.findByIdAndUserIdWithTopics(id, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        List<String> topics = quiz.getQuizTopics() != null ? quiz.getQuizTopics().stream()
                .map(QuizTopic::getTopicName)
                .collect(Collectors.toList()) : List.of();

        var totalCorrectAnswers = quizQuestionResponseRepository.countByQuizIdAndIsCorrect(id, true);

        return new QuizSummaryResponseDto(
                topics,
                quiz.getQuestionsCount(),
                totalCorrectAnswers);
    }

    public GetContentEntriesResponse getContentEntriesByBankId(Long bankId, UUID userId) {
        try {
            contentBankRepository.findByIdAndUserId(bankId, userId)
                    .orElseThrow(() -> new RuntimeException(
                            "Content bank not found or access denied for user " + userId));

            log.info("Content bank {} validated for user {}", bankId, userId);

            var contentEntryPage = contentEntryRepository.findByContentEntryBanks_ContentBank_Id(bankId,
                    PageRequest.of(0, Integer.MAX_VALUE));
            var contentEntries = contentEntryPage.getContent();

            log.info("Found {} content entries for bankId: {}", contentEntries.size(), bankId);

            if (contentEntries.isEmpty()) {
                log.warn("No content entries found for bankId: {}", bankId);
            }

            var mappedEntries = new ArrayList<GetContentEntriesResponse.ContentEntryDto>();
            var entriesSkipped = 0;

            for (var entry : contentEntries) {
                if (entry.getQuestionsGenerated() != null && entry.getQuestionsGenerated()) {
                    entriesSkipped++;
                    continue;
                }
                mappedEntries.add(new GetContentEntriesResponse.ContentEntryDto(
                        entry.getId(),
                        entry.getPageTitle() != null ? entry.getPageTitle() : "",
                        entry.getContent() != null ? entry.getContent() : "",
                        entry.getWordCount() != null ? entry.getWordCount() : 0));
            }

            var instruction = quizGenerationInstructionRepository
                    .findFirstByUserId(userId).orElse(null);

            var request = new GetContentEntriesResponse.GenerateQuizRequest(
                    instruction != null ? instruction.getInstruction() : "",
                    mappedEntries);

            return new GetContentEntriesResponse(request, entriesSkipped);
        } catch (Exception error) {
            log.error("Failed to fetch content entries for bankId: {}", bankId, error);
            throw error;
        }
    }

    public UpdateQuizDateResponse updateQuizDate(Long quizId) {
        try {
            var quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new NotFoundException("Quiz not found"));

            quiz.setQuestionUpdatedAt(LocalDateTime.now());
            var updatedQuiz = quizRepository.save(quiz);

            log.info("Quiz {} questionUpdatedAt updated to {}", quizId, updatedQuiz.getQuestionUpdatedAt());

            return new UpdateQuizDateResponse("Quiz date updated successfully", true);
        } catch (Exception error) {
            log.error("Failed to update quiz date for quizId: {}", quizId, error);
            return new UpdateQuizDateResponse("Failed to update quiz date", false);
        }
    }

    @Transactional(readOnly = true)
    public CheckQuizInProgressResponse checkQuizInProgress(UUID userId) {
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
                        quiz.getContentBank() != null ? quiz.getContentBank().getId().toString() : null,
                        quiz.getBankName());
            }

            if (QuizStatus.READY_WITH_ERROR.getValue().equals(finalStatus)) {
                quiz.setStatus(QuizStatus.READY_WITH_ERROR);
                quizRepository.save(quiz);
            }
        }

        return new CheckQuizInProgressResponse(Objects.nonNull(inProgressQuiz), inProgressQuiz);
    }

    public void remove(UUID userId, Long id) {
        var quiz = quizRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));

        quizRepository.delete(quiz);
    }

    @Transactional
    public String createQuiz(UUID userId, CreateQuizDTO request) {
        var contentBank = contentBankRepository
                .findByIdAndUserIdWithContentEntries(request.bankId(), userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or you do not have permission to access it"));

        Quiz quiz;

        if (Objects.nonNull(request.quizId())) {
            quiz = quizRepository.findByIdAndUserId(Integer.valueOf(request.quizId()), userId)
                    .orElseThrow(() -> new NotFoundException(
                            "Quiz not found or you do not have permission to access it"));

            quiz.setStatus(request.status());
            quiz.setQuestionUpdatedAt(LocalDateTime.now());
            quiz = quizRepository.save(quiz);
        } else {
            // Create new quiz
            quiz = new Quiz();
            quiz.setUserId(userId);
            quiz.setContentBank(contentBank);
            quiz.setBankName(contentBank.getName());
            quiz.setContentEntriesCount(0);
            quiz.setQuestionsCount(0);
            quiz.setQuestionsCompleted(0);
            quiz.setStatus(request.status());
            quiz = quizRepository.save(quiz);
        }

        var allQuestions = contentBank.getContentEntries().stream()
                .flatMap(entry -> entry.getQuestions().stream())
                .collect(Collectors.toList());

        var allTopics = contentBank.getContentEntries().stream()
                .flatMap(entry -> entry.getTopics().stream())
                .map(Topic::getTopic)
                .collect(Collectors.toSet());

        if (allQuestions.isEmpty()) {
            quiz.setContentEntriesCount(contentBank.getContentEntries().size());
            quiz.setQuestionsCount(0);
            quizRepository.save(quiz);
            return quiz.getId().toString();
        }

        var createdQuestions = new ArrayList<QuizQuestion>();

        for (var question : allQuestions) {
            var contentEntry = question.getContentEntry();

            var quizQuestion = new QuizQuestion();
            quizQuestion.setQuestion(question.getQuestion());
            quizQuestion.setType(question.getType());
            quizQuestion.setContentEntryType(
                    contentEntry != null ? contentEntry.getContentType() : ContentType.SELECTED_TEXT);
            quizQuestion.setContentEntrySourceUrl(contentEntry != null ? contentEntry.getSourceUrl() : null);
            quizQuestion.setContentEntry(contentEntry);
            quizQuestion.setQuiz(quiz);

            quizQuestion = quizQuestionRepository.save(quizQuestion);
            createdQuestions.add(quizQuestion);

            for (var option : question.getQuestionOptions()) {
                var quizOption = new QuizQuestionOption();
                quizOption.setQuizQuestion(quizQuestion);
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
                quizTopic.setQuiz(quiz);
                quizTopic.setTopicName(topicName);
                quizTopicRepository.save(quizTopic);
            }
        }

        quiz.setContentEntriesCount(contentBank.getContentEntries().size());
        quiz.setQuestionsCount(createdQuestions.size());
        quizRepository.save(quiz);

        return quiz.getId().toString();
    }

    public CreateQuestionResponse createQuestion(CreateQuestionRequest request, UUID userId) {
        var contentEntryId = request.contentEntryId();
        var questionText = request.question();
        var options = request.options();

        var contentEntry = contentEntryRepository.findById(contentEntryId)
                .orElseThrow(() -> new NotFoundException(
                        "Content entry not found or you do not have permission to access it"));

        if (Objects.isNull(options) || options.isEmpty()) {
            log.error("No options provided for question");
            return new CreateQuestionResponse("No options provided for question", 0L);
        }

        var question = new Question();
        question.setQuestion(questionText);
        question.setType("single_choice");
        question.setContentEntry(contentEntry);

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

        return new CreateQuestionResponse("Question created successfully", savedQuestion.getId());
    }

    public UpdateQuizResponse updateQuiz(UUID userId, String quizId, String questionOptionId) {
        var quizIdLong = Long.parseLong(quizId);
        var optionSelectedId = Long.parseLong(questionOptionId);

        var quiz = quizRepository.findByIdAndUserIdWithQuestions(quizIdLong, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        if (quiz.getQuestionsCompleted() >= quiz.getQuestionsCount()) {
            return new UpdateQuizResponse(
                    "Quiz is already completed",
                    false,
                    false);
        }

        var sortedQuestions = quiz.getQuizQuestions().stream()
                .sorted((q1, q2) -> q1.getId().compareTo(q2.getId()))
                .toList();

        if (quiz.getQuestionsCompleted() >= sortedQuestions.size()) {
            return new UpdateQuizResponse(
                    "Quiz is already completed",
                    false,
                    false);
        }

        var currentQuestion = sortedQuestions.get(quiz.getQuestionsCompleted());

        if (Objects.isNull(currentQuestion)) {
            return new UpdateQuizResponse(
                    "No more questions available",
                    false,
                    false);
        }

        var selectedOption = currentQuestion.getQuizQuestionOptions().stream()
                .filter(option -> option.getId().equals(optionSelectedId))
                .findFirst()
                .orElse(null);

        if (isNull(selectedOption)) {
            return new UpdateQuizResponse(
                    "Invalid question option selected",
                    false,
                    false);
        }

        var correctOption = currentQuestion.getQuizQuestionOptions().stream()
                .filter(QuizQuestionOption::getIsCorrect)
                .findFirst()
                .orElse(null);

        if (Objects.isNull(correctOption)) {
            log.error("No correct option found for question {}", currentQuestion.getId());
            return new UpdateQuizResponse(
                    "Question configuration error",
                    false,
                    false);
        }

        // Create a new QuizQuestionResponse
        var response = new QuizQuestionResponse();
        response.setQuiz(quiz);
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
                true, isCompleted);
    }

    public void emitCreateQuizEvent(String userId, String quizId, Long bankId) {
        try {
            var contentEntriesResponse = getContentEntriesByBankId(
                    bankId.longValue(), UUID.fromString(userId));

            var quizRequest = contentEntriesResponse.request();
            var entriesSkipped = contentEntriesResponse.entriesSkipped();

            kafkaProducerService.emitCreateQuizEvent(
                    new GenerateQuizRequest(
                            quizRequest.instructions(),
                            quizRequest.contentEntries().stream()
                                    .map(entry -> new ContentEntryDto(
                                            entry.id(),
                                            entry.pageTitle(),
                                            entry.content(),
                                            entry.wordCountAnalyzed()))
                                    .collect(Collectors.toList())),
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