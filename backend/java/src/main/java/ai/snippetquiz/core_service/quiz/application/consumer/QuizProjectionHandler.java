package ai.snippetquiz.core_service.quiz.application.consumer;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.events.QuizAnswerMarkedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizCreatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizQuestionsAddedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizStatusUpdatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizProjectionRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriberFor;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@AggregateEventSubscriberFor(Quiz.class)
@Service
@RequiredArgsConstructor
public class QuizProjectionHandler implements AggregateEventSubscriber {
    private final QuizProjectionRepository quizProjectionRepository;

    @Override
    public void on(DomainEvent event) {
        var quizId = QuizId.map(event.getAggregateId());
        var userId = UserId.map(event.getUserId());
        if (event instanceof QuizDeletedDomainEvent) {
            quizProjectionRepository.deleteById(quizId);
            return;
        }
        var quizProjectionBuilder = QuizProjection.builder().id(quizId).userId(userId);
        switch (event) {
            case QuizCreatedDomainEvent created -> quizProjectionBuilder
                    .contentBankId(ContentBankId.map(created.getContentBankId()))
                    .bankName(created.getBankName())
                    .status(created.getStatus())
                    .createdAt(created.getCreatedAt())
                    .questions(new HashSet<>())
                    .responses(new HashSet<>())
                    .build();
            case QuizStatusUpdatedDomainEvent statusUpdated -> quizProjectionBuilder.status(statusUpdated.getStatus());
            case QuizQuestionsAddedDomainEvent questionsAdded -> {
                var currentProjection = quizProjectionRepository.findById(quizId);
                currentProjection.getQuestions()
                        .addAll(questionsAdded.getQuizQuestions()
                                .stream()
                                .map(question -> question.getId().toString()).toList()
                        );

                quizProjectionBuilder.topics(questionsAdded.getQuizTopics())
                        .status(questionsAdded.getStatus())
                        .questionUpdatedAt(questionsAdded.getUpdatedAt())
                        .contentEntriesCount(questionsAdded.getContentEntriesCount().getValue())
                        .questions(currentProjection.getQuestions())
                        .questionsCount(currentProjection.getQuestions().size());
            }
            case QuizAnswerMarkedDomainEvent answerMarked -> {
                var currentProjection = quizProjectionRepository.findById(quizId);
                currentProjection.getResponses().add(answerMarked.getQuizQuestionResponse().getQuizQuestion().toString());

                quizProjectionBuilder.responses(currentProjection.getResponses())
                        .questionsCompleted(currentProjection.getResponses().size());
            }
            default -> {
            }
        }
        quizProjectionRepository.upsert(quizProjectionBuilder.build());
    }
}