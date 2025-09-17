package ai.snippetquiz.core_service.service;

import ai.snippetquiz.core_service.dto.request.*;
import ai.snippetquiz.core_service.dto.response.*;
import ai.snippetquiz.core_service.dto.response.QuizQuestionDTOResponse;
import ai.snippetquiz.core_service.entity.*;
import ai.snippetquiz.core_service.repository.*;
import ai.snippetquiz.core_service.exception.NotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public PaginatedQuizzesResponse findAll(UUID userId, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Quiz> quizPage = quizRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<QuizResponse> quizResponses = quizPage.getContent().stream()
                .map(quiz -> {
                    List<String> topics = quiz.getQuizTopics() != null ? quiz.getQuizTopics().stream()
                            .map(QuizTopic::getTopicName)
                            .collect(Collectors.toList()) : List.of();

                    return new QuizResponse(
                            quiz.getId().toString(),
                            quiz.getBankName(),
                            quiz.getCreatedAt(),
                            quiz.getQuestionsCount(),
                            quiz.getQuestionsCompleted(),
                            getFinalStatus(quiz),
                            quiz.getContentEntriesCount(),
                            topics);
                })
                .collect(Collectors.toList());

        return new PaginatedQuizzesResponse(
                quizResponses,
                quizPage.getTotalPages(),
                quizPage.getTotalElements(),
                page,
                limit);
    }

    @Transactional(readOnly = true)
    public FindOneQuizResponse findOne(UUID userId, String id) {
        Long quizId = Long.parseLong(id);
        Quiz quiz = quizRepository.findByIdAndUserIdWithTopics(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found " + quizId));

        List<String> topics = quiz.getQuizTopics() != null ? quiz.getQuizTopics().stream()
                .map(QuizTopic::getTopicName)
                .collect(Collectors.toList()) : List.of();

        var currentQuestion = quizQuestionRepository.findByQuizIdWithOptions(quizId).get(quiz.getQuestionsCompleted());
        QuizQuestionDTOResponse currentQuestionDto = null;

        if (Objects.nonNull(currentQuestion)) {
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
    public PaginatedQuizResponsesDto findQuizResponses(UUID userId, FindQuizResponsesRequest request) {
        Long quizId = Long.valueOf(request.getQuizId());
        Integer page = request.getPage();
        Integer limit = request.getLimit();

        // Verify quiz ownership
        quizRepository.findByIdAndUserId(quizId, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        // Get total count of responses
        long total = quizQuestionResponseRepository.countByQuizId(quizId);

        // Get quiz responses with pagination
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<QuizQuestionResponse> responsePage = quizQuestionResponseRepository
                .findByQuizIdWithDetailsOrderByCreatedAtDesc(quizId, pageable);

        List<QuizResponseItemDto> formattedResponses = responsePage.getContent().stream()
                .map(response -> {
                    QuizQuestion question = response.getQuizQuestion();
                    QuizQuestionOption selectedOption = response.getQuizQuestionOption();

                    return new QuizResponseItemDto(
                            response.getIsCorrect(),
                            question != null ? question.getQuestion() : "",
                            selectedOption != null ? selectedOption.getOptionText() : "",
                            response.getCorrectAnswer(),
                            selectedOption != null ? selectedOption.getOptionExplanation() : "",
                            question != null ? question.getContentEntrySourceUrl() : "");
                })
                .collect(Collectors.toList());

        PaginationInfo pagination = new PaginationInfo(page, limit, total);

        return new PaginatedQuizResponsesDto(formattedResponses, pagination);
    }

    @Transactional(readOnly = true)
    public QuizSummaryResponseDto findQuizSummary(Long id, UUID userId) {
        Quiz quiz = quizRepository.findByIdAndUserIdWithTopics(id, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        List<String> topics = quiz.getQuizTopics() != null ? quiz.getQuizTopics().stream()
                .map(QuizTopic::getTopicName)
                .collect(Collectors.toList()) : List.of();

        // Get total correct answers count
        Integer totalCorrectAnswers = quizQuestionResponseRepository.countByQuizIdAndIsCorrect(id, true);

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

            List<ContentEntry> contentEntries = contentEntryRepository.findByContentBankId(bankId, PageRequest.of(0, Integer.MAX_VALUE));

            log.info("Found {} content entries for bankId: {}", contentEntries.size(), bankId);

            if (contentEntries.isEmpty()) {
                log.warn("No content entries found for bankId: {}", bankId);
            }

            List<GetContentEntriesResponse.ContentEntryDto> mappedEntries = new ArrayList<>();
            int entriesSkipped = 0;

            for (ContentEntry entry : contentEntries) {
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

            QuizGenerationInstruction instruction = quizGenerationInstructionRepository
                    .findFirstByUserId(userId).orElse(null);

            GetContentEntriesResponse.GenerateQuizRequest request = new GetContentEntriesResponse.GenerateQuizRequest(
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
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new NotFoundException("Quiz not found"));

            quiz.setQuestionUpdatedAt(LocalDateTime.now());
            Quiz updatedQuiz = quizRepository.save(quiz);

            log.info("Quiz {} questionUpdatedAt updated to {}", quizId, updatedQuiz.getQuestionUpdatedAt());

            return new UpdateQuizDateResponse("Quiz date updated successfully", true);
        } catch (Exception error) {
            log.error("Failed to update quiz date for quizId: {}", quizId, error);
            return new UpdateQuizDateResponse("Failed to update quiz date", false);
        }
    }

    @Transactional(readOnly = true)
    public CheckQuizInProgressResponse checkQuizInProgress(UUID userId) {

        List<Quiz> inProgressQuizzes = quizRepository.findAllByUserIdAndStatus(userId,
                QuizStatus.IN_PROGRESS);

        if (inProgressQuizzes.isEmpty()) {
            return new CheckQuizInProgressResponse(false, null);
        }

        QuizInProgressDetails inProgressQuiz = null;

        for (Quiz quiz : inProgressQuizzes) {
            String finalStatus = getFinalStatus(quiz);

            if (QuizStatus.IN_PROGRESS.getValue().equals(finalStatus)) {
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

        return new CheckQuizInProgressResponse(inProgressQuiz != null, inProgressQuiz);
    }

    public void remove(UUID userId, Long id) {
        Quiz quiz = quizRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));

        quizRepository.delete(quiz);
    }

    @Transactional
    public String createQuiz(UUID userId, CreateQuizRequest request) {
        // Find content bank with all related data
        ContentBank contentBank = contentBankRepository
                .findByIdAndUserIdWithContentEntries(request.bankId(), userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or you do not have permission to access it"));

        Quiz quiz;

        // Handle existing quiz update or create new quiz
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

        // Collect all questions from content entries
        List<Question> allQuestions = contentBank.getContentEntries().stream()
                .flatMap(entry -> entry.getQuestions().stream())
                .collect(Collectors.toList());

        // Collect all unique topics
        Set<String> allTopics = contentBank.getContentEntries().stream()
                .flatMap(entry -> entry.getTopics().stream())
                .map(Topic::getTopic)
                .collect(Collectors.toSet());

        if (allQuestions.isEmpty()) {
            // Update quiz with entry count but no questions
            quiz.setContentEntriesCount(contentBank.getContentEntries().size());
            quiz.setQuestionsCount(0);
            quizRepository.save(quiz);
            return quiz.getId().toString();
        }

        // Create quiz questions and options
        List<QuizQuestion> createdQuestions = new ArrayList<>();

        for (Question question : allQuestions) {
            ContentEntry contentEntry = question.getContentEntry();

            QuizQuestion quizQuestion = new QuizQuestion();
            quizQuestion.setQuestion(question.getQuestion());
            quizQuestion.setType(question.getType());
            quizQuestion.setContentEntryType(
                    contentEntry != null ? contentEntry.getContentType() : ContentType.SELECTED_TEXT);
            quizQuestion.setContentEntrySourceUrl(contentEntry != null ? contentEntry.getSourceUrl() : null);
            quizQuestion.setContentEntry(contentEntry);
            quizQuestion.setQuiz(quiz);

            quizQuestion = quizQuestionRepository.save(quizQuestion);
            createdQuestions.add(quizQuestion);

            // Create quiz question options
            for (QuestionOption option : question.getQuestionOptions()) {
                QuizQuestionOption quizOption = new QuizQuestionOption();
                quizOption.setQuizQuestion(quizQuestion);
                quizOption.setOptionText(option.getOptionText());
                quizOption.setOptionExplanation(option.getOptionExplanation());
                quizOption.setIsCorrect(option.getIsCorrect());

                quizQuestionOptionRepository.save(quizOption);
            }
        }

        // Create quiz topics using upsert logic
        for (String topicName : allTopics) {
            Optional<QuizTopic> existingTopic = quizTopicRepository
                    .findByQuizIdAndTopicName(quiz.getId(), topicName);

            if (existingTopic.isEmpty()) {
                QuizTopic quizTopic = new QuizTopic();
                quizTopic.setQuiz(quiz);
                quizTopic.setTopicName(topicName);
                quizTopicRepository.save(quizTopic);
            }
        }

        // Update quiz with final counts
        quiz.setContentEntriesCount(contentBank.getContentEntries().size());
        quiz.setQuestionsCount(createdQuestions.size());
        quizRepository.save(quiz);

        log.info("[createQuiz] Created {} questions for quiz {}",
                createdQuestions.size(), quiz.getId());

        return quiz.getId().toString();
    }

    public CreateQuestionResponse createQuestion(CreateQuestionRequest request, UUID userId) {
        Long contentEntryId = request.contentEntryId();
        String questionText = request.question();
        List<QuestionOptionRequest> options = request.options();

        // Verify content entry exists
        ContentEntry contentEntry = contentEntryRepository.findById(contentEntryId)
                .orElseThrow(() -> new NotFoundException(
                        "Content entry not found or you do not have permission to access it"));

        if (options == null || options.isEmpty()) {
            log.error("[createQuestion] No options provided for question");
            return new CreateQuestionResponse("No options provided for question", 0L);
        }

        // Create the question with hardcoded type
        Question question = new Question();
        question.setQuestion(questionText);
        question.setType("multiple_choice"); // Hardcoded as in NestJS
        question.setContentEntry(contentEntry);

        Question savedQuestion = questionRepository.save(question);
        var quizQuestionOptions = new ArrayList<QuestionOption>();

        // Create question options
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
        Long quizIdLong = Long.parseLong(quizId);
        Long optionSelectedId = Long.parseLong(questionOptionId);

        // Validate if the quiz belongs to the user
        Quiz quiz = quizRepository.findByIdAndUserIdWithQuestions(quizIdLong, userId)
                .orElseThrow(() -> new NotFoundException("Quiz not found or you do not have permission to access it"));

        // Check if quiz is already completed
        if (quiz.getQuestionsCompleted() >= quiz.getQuestionsCount()) {
            return new UpdateQuizResponse(
                    "Quiz is already completed",
                    false,
                    false);
        }

        // Get the current question (next question to answer)
        List<QuizQuestion> sortedQuestions = quiz.getQuizQuestions().stream()
                .sorted((q1, q2) -> q1.getId().compareTo(q2.getId()))
                .collect(Collectors.toList());

        if (quiz.getQuestionsCompleted() >= sortedQuestions.size()) {
            return new UpdateQuizResponse(
                    "Quiz is already completed",
                    false,
                    false);
        }

        QuizQuestion currentQuestion = sortedQuestions.get(quiz.getQuestionsCompleted());

        if (isNull(currentQuestion)) {
            return new UpdateQuizResponse(
                    "No more questions available",
                    false,
                    false);
        }

        // Validate if the question_option_id exists in the current question's options
        QuizQuestionOption selectedOption = currentQuestion.getQuizQuestionOptions().stream()
                .filter(option -> option.getId().equals(optionSelectedId))
                .findFirst()
                .orElse(null);

        if (isNull(selectedOption)) {
            return new UpdateQuizResponse(
                    "Invalid question option selected",
                    false,
                    false);
        }

        // Find the correct answer for this question
        QuizQuestionOption correctOption = currentQuestion.getQuizQuestionOptions().stream()
                .filter(QuizQuestionOption::getIsCorrect)
                .findFirst()
                .orElse(null);

        if (isNull(correctOption)) {
            log.error("No correct option found for question {}", currentQuestion.getId());
            return new UpdateQuizResponse(
                    "Question configuration error",
                    false,
                    false);
        }

        // Create a new QuizQuestionResponse
        QuizQuestionResponse response = new QuizQuestionResponse();
        response.setQuiz(quiz);
        response.setQuizQuestion(currentQuestion);
        response.setQuizQuestionOption(selectedOption);
        response.setIsCorrect(selectedOption.getIsCorrect());
        response.setCorrectAnswer(correctOption.getOptionText());
        response.setResponseTime("0");

        quizQuestionResponseRepository.save(response);

        // Increment Quiz.questionsCompleted
        Integer updatedQuestionsCompleted = quiz.getQuestionsCompleted() + 1;
        boolean isCompleted = updatedQuestionsCompleted >= quiz.getQuestionsCount() &&
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

    public EmitCreateQuizEventResponse emitCreateQuizEvent(String userId, String quizId, Long bankId) {
        try {
            // Get content entries by bank ID
            GetContentEntriesResponse contentEntriesResponse = getContentEntriesByBankId(
                    bankId.longValue(), UUID.fromString(userId));

            // Extract the GenerateQuizRequest from the response
            GetContentEntriesResponse.GenerateQuizRequest quizRequest = contentEntriesResponse.request();
            Integer entriesSkipped = contentEntriesResponse.entriesSkipped();

            // Emit the Kafka event using the existing KafkaProducerService
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

            return new EmitCreateQuizEventResponse(
                    "Quiz generation event emitted successfully",
                    entriesSkipped);

        } catch (Exception error) {
            log.error("Failed to emit create quiz event for quizId: {}, bankId: {}, userId: {}",
                    quizId, bankId, userId, error);
            throw new RuntimeException("Failed to emit create quiz event", error);
        }
    }

}