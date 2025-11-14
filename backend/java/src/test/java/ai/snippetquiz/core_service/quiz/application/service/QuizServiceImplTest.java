package ai.snippetquiz.core_service.quiz.application.service;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.instruction.domain.QuizGenerationInstruction;
import ai.snippetquiz.core_service.instruction.domain.port.QuizGenerationInstructionRepository;
import ai.snippetquiz.core_service.question.domain.Question;
import ai.snippetquiz.core_service.question.domain.port.QuestionRepository;
import ai.snippetquiz.core_service.quiz.application.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.quiz.application.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.quiz.application.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.messaging.CreateQuizEventPublisher;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizProjectionRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.service.EventSourcingHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.ConflictException;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizServiceImplTest {

    @Mock
    private ContentBankRepository contentBankRepository;

    @Mock
    private ContentEntryRepository contentEntryRepository;

    @Mock
    private QuizGenerationInstructionRepository quizGenerationInstructionRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ContentEntryTopicRepository contentEntryTopicRepository;

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private CreateQuizEventPublisher createQuizEventPublisher;

    @Mock
    private EventSourcingHandler<Quiz> quizEventSourcingHandler;

    @Mock
    private QuizProjectionRepository quizProjectionRepository;

    @InjectMocks
    private QuizServiceImpl quizService;

    private UserId userId;
    private ContentBankId contentBankId;
    private QuizId quizId;

    @BeforeEach
    void setUp() {
        userId = new UserId(UUID.randomUUID());
        contentBankId = new ContentBankId(UUID.randomUUID());
        quizId = new QuizId(UUID.randomUUID());
    }

    @Nested
    class FindAllTests {
        @Test
        void findAll_shouldReturnPagedQuizzes() {
            // Given
            Pageable pageable = PageRequest.of(0, 10);
            QuizProjection quizProjection = new QuizProjection();
            quizProjection.setId(quizId);
            quizProjection.setBankName("Test Bank");
            quizProjection.setCreatedAt(LocalDateTime.now());
            quizProjection.setQuestionsCount(10);
            quizProjection.setQuestionsCompleted(5);
            quizProjection.setStatus(QuizStatus.IN_PROGRESS);
            quizProjection.setContentEntriesCount(2);
            quizProjection.setTopics(new HashSet<>(asList("Java", "Spring")));

            Page<QuizProjection> quizPage = new PageImpl<>(List.of(quizProjection));
            when(quizProjectionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)).thenReturn(quizPage);

            // When
            PagedModelResponse<QuizResponse> result = quizService.findAll(userId, pageable);

            // Then
            assertThat(result.getMetadata().totalElements()).isEqualTo(1);
            assertThat(result.getContent()).hasSize(1);
            QuizResponse quizResponse = result.getContent().get(0);
            assertThat(quizResponse.id()).isEqualTo(quizId.toString());
            assertThat(quizResponse.name()).isEqualTo("Test Bank");
            assertThat(quizResponse.topics()).contains("Java", "Spring");
        }
    }

    @Nested
    class FindOneTests {
        @Test
        void findOne_whenQuizNotFound_throwsNotFoundException() {
            // Given
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> quizService.findOne(userId, quizId));
        }

        @Test
        void findOne_whenQuizFound_returnsQuizDetails() {
            // Given
            Quiz quiz = new Quiz(quizId, userId, contentBankId, "Test Bank");
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.of(quiz));

            // When
            FindOneQuizResponse response = quizService.findOne(userId, quizId);

            // Then
            assertThat(response.getId()).isEqualTo(quizId.toString());
            assertThat(response.getName()).isEqualTo("Test Bank");
        }
    }

    @Nested
    class CheckQuizInProgressTests {
        @Test
        void checkQuizInProgress_whenNoInProgressQuiz_returnsFalse() {
            // Given
            when(quizProjectionRepository.findAllByUserIdAndStatus(userId, QuizStatus.IN_PROGRESS))
                    .thenReturn(Collections.emptyList());

            // When
            CheckQuizInProgressResponse response = quizService.checkQuizInProgress(userId);

            // Then
            assertThat(response.getInProgress()).isFalse();
            assertThat(response.getDetails()).isNull();
        }

        @Test
        void checkQuizInProgress_whenInProgressQuizExists_returnsTrueWithDetails() {
            // Given
            QuizProjection quizProjection = new QuizProjection();
            quizProjection.setId(quizId);
            quizProjection.setStatus(QuizStatus.IN_PROGRESS);
            quizProjection.setBankName("In Progress Bank");
            quizProjection.setContentBankId(contentBankId);
            when(quizProjectionRepository.findAllByUserIdAndStatus(userId, QuizStatus.IN_PROGRESS))
                    .thenReturn(List.of(quizProjection));

            // When
            CheckQuizInProgressResponse response = quizService.checkQuizInProgress(userId);

            // Then
            assertThat(response.getInProgress()).isTrue();
            assertThat(response.getDetails()).isNotNull();
            assertThat(response.getDetails().quizId()).isEqualTo(quizId.toString());
        }
    }

    @Nested
    class DeleteTests {
        @Test
        void delete_whenQuizNotFound_throwsNotFoundException() {
            // Given
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> quizService.delete(userId, quizId));
        }

        @Test
        void delete_whenQuizFound_callsDeleteOnQuiz() {
            // Given
            Quiz quiz = mock(Quiz.class);
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.of(quiz));

            // When
            quizService.delete(userId, quizId);

            // Then
            verify(quiz, times(1)).delete();
        }
    }

    @Nested
    class CreateQuizTests {
        @Test
        void createQuiz_whenQuizInProgress_throwsConflictException() {
            // Given
            var quizProjection = new QuizProjection();
            quizProjection.setId(quizId);
            quizProjection.setStatus(QuizStatus.IN_PROGRESS);
            when(quizProjectionRepository.findAllByUserIdAndStatus(userId, QuizStatus.IN_PROGRESS))
                    .thenReturn(List.of(quizProjection));

            // When & Then
            assertThrows(ConflictException.class, () -> quizService.createQuiz(userId, contentBankId, quizId));
        }

        @Test
        void createQuiz_whenContentBankNotFound_throwsNotFoundException() {
            // Given
            when(quizProjectionRepository.findAllByUserIdAndStatus(userId, QuizStatus.IN_PROGRESS))
                    .thenReturn(Collections.emptyList());
            when(contentBankRepository.findByIdAndUserIdWithContentEntries(contentBankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> quizService.createQuiz(userId, contentBankId, quizId));
        }

        @Test
        void createQuiz_whenQuizAlreadyExists_throwsConflictException() {
            // Given
            when(quizProjectionRepository.findAllByUserIdAndStatus(userId, QuizStatus.IN_PROGRESS))
                    .thenReturn(Collections.emptyList());
            ContentBank contentBank = new ContentBank(contentBankId, userId, "Test Bank");
            when(contentBankRepository.findByIdAndUserIdWithContentEntries(contentBankId, userId)).thenReturn(Optional.of(contentBank));
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.of(new Quiz()));

            // When & Then
            assertThrows(ConflictException.class, () -> quizService.createQuiz(userId, contentBankId, quizId));
        }

        @Test
        void createQuiz_success() {
            // Given
            ContentBank contentBank = new ContentBank(contentBankId, userId, "Test Bank");
            when(quizProjectionRepository.findAllByUserIdAndStatus(userId, QuizStatus.IN_PROGRESS))
                    .thenReturn(Collections.emptyList());
            when(contentBankRepository.findByIdAndUserIdWithContentEntries(contentBankId, userId)).thenReturn(Optional.of(contentBank));
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.empty());
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.of(contentBank));
            when(contentEntryRepository.findAllByContentBankId(contentBankId)).thenReturn(Collections.emptyList());
            when(quizGenerationInstructionRepository.findFirstByUserId(userId)).thenReturn(Optional.of(new QuizGenerationInstruction()));
            when(questionRepository.findByContentEntryIdIn(any())).thenReturn(Collections.emptyList());

            // When
            quizService.createQuiz(userId, contentBankId, quizId);

            // Then
            ArgumentCaptor<Quiz> quizCaptor = ArgumentCaptor.forClass(Quiz.class);
            verify(quizEventSourcingHandler, times(1)).save(quizCaptor.capture());
            Quiz savedQuiz = quizCaptor.getValue();
            assertThat(savedQuiz.getId()).isEqualTo(quizId);
            assertThat(savedQuiz.getStatus()).isEqualTo(QuizStatus.PREPARE);
        }
    }

    @Nested
    class UpdateQuizTests {
        @Test
        void updateQuiz_whenQuizNotFound_throwsNotFoundException() {
            // Given
            QuizQuestionOptionId optionId = new QuizQuestionOptionId(UUID.randomUUID());
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> quizService.updateQuiz(userId, quizId, optionId));
        }

        @Test
        void updateQuiz_whenQuizIsCompleted_returnsCompletedResponse() {
            // Given
            Quiz quiz = mock(Quiz.class);
            when(quiz.getQuizQuestionResponses()).thenReturn(List.of());
            when(quiz.getQuizQuestions()).thenReturn(List.of());
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.of(quiz));
            QuizQuestionOptionId optionId = new QuizQuestionOptionId(UUID.randomUUID());

            // When
            UpdateQuizResponse response = quizService.updateQuiz(userId, quizId, optionId);

            // Then
            assertThat(response.getMessage()).isEqualTo("Quiz is already completed");
            assertThat(response.getCompleted()).isTrue();
        }

        @Test
        void updateQuiz_withValidAnswer() {
            // Given
            Quiz quiz = new Quiz(quizId, userId, contentBankId, "Test Bank");
            QuizQuestion question = new QuizQuestion();
            question.setQuestion("What is Java?");
            QuizQuestionOption correctOption = new QuizQuestionOption();
            correctOption.setId(new QuizQuestionOptionId(UUID.randomUUID()));
            correctOption.setOptionText("A programming language");
            correctOption.setIsCorrect(true);
            question.getQuizQuestionOptions().add(correctOption);
            quiz.addQuestions(QuizStatus.IN_PROGRESS, 1, Collections.emptySet(), List.of(question));

            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.of(quiz));

            // When
            UpdateQuizResponse response = quizService.updateQuiz(userId, quizId, correctOption.getId());

            // Then
            assertThat(response.getCompleted()).isFalse();
            verify(quizEventSourcingHandler).save(quiz);
        }

        @Test
        void updateQuizCompleted_withValidAnswer() {
            // Given
            Quiz quiz = new Quiz(quizId, userId, contentBankId, "Test Bank");
            QuizQuestion question = new QuizQuestion();
            question.setQuestion("What is Java?");
            QuizQuestionOption correctOption = new QuizQuestionOption();
            correctOption.setId(new QuizQuestionOptionId(UUID.randomUUID()));
            correctOption.setOptionText("A programming language");
            correctOption.setIsCorrect(true);
            question.getQuizQuestionOptions().add(correctOption);
            quiz.addQuestions(QuizStatus.READY, 1, Collections.emptySet(), List.of(question));

            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.of(quiz));

            // When
            UpdateQuizResponse response = quizService.updateQuiz(userId, quizId, correctOption.getId());

            // Then
            assertThat(response.getCompleted()).isTrue();
            verify(quizEventSourcingHandler).save(quiz);
        }
    }

    @Nested
    class FindQuizSummaryTests {

        @Test
        void findQuizSummary_whenQuizNotFound_throwsNotFoundException() {
            // Given
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> quizService.findQuizSummary(quizId, userId));
        }

        @Test
        void findQuizSummary_returnsSummary() {
            // Given
            Quiz quiz = new Quiz(quizId, userId, contentBankId, "Test Bank");
            // You would add questions and responses to the quiz object here
            when(quizEventSourcingHandler.getById(userId, quizId.toString())).thenReturn(Optional.of(quiz));

            // When
            QuizSummaryResponseDto summary = quizService.findQuizSummary(quizId, userId);

            // Then
            assertThat(summary).isNotNull();
            assertThat(summary.getTotalQuestions()).isEqualTo(0);
            assertThat(summary.getTotalCorrectAnswers()).isEqualTo(0);
        }
    }

    @Nested
    class ProcessNewQuizQuestionsTests {

        @Test
        void processNewQuizQuestions_addsQuestionsToQuiz() {
            // Given
            Quiz quiz = new Quiz(quizId, userId, contentBankId, "Test Bank");
            ContentEntry contentEntry = new ContentEntry();
            contentEntry.setId(new ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId(UUID.randomUUID()));
            Question question = new Question();
            question.setContentEntryId(contentEntry.getId());

            when(contentEntryRepository.findAllByContentBankId(contentBankId)).thenReturn(List.of(contentEntry));
            when(questionRepository.findByContentEntryIdIn(any())).thenReturn(List.of(question));
            when(contentEntryTopicRepository.findByContentEntryIdIn(any())).thenReturn(Collections.emptyList());
            when(topicRepository.findByUserIdAndIdIn(any(), any())).thenReturn(Collections.emptyList());

            // When
            quizService.processNewQuizQuestions(quiz, QuizStatus.IN_PROGRESS);

            // Then
            ArgumentCaptor<Quiz> quizCaptor = ArgumentCaptor.forClass(Quiz.class);
            verify(quizEventSourcingHandler).save(quizCaptor.capture());
            Quiz savedQuiz = quizCaptor.getValue();
            assertThat(savedQuiz.getQuizQuestions()).hasSize(1);
            assertThat(savedQuiz.getStatus()).isEqualTo(QuizStatus.IN_PROGRESS);
        }
    }
}