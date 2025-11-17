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
        var quizId = new QuizId(event.getAggregateId());
        var userId = new UserId(event.getUserId());
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
                var questions = currentProjection != null ? currentProjection.getQuestions() : new HashSet<String>();
                questions.addAll(questionsAdded.getQuizQuestions()
                                .stream()
                                .map(question -> question.getId().toString()).toList()
                        );

                quizProjectionBuilder.topics(questionsAdded.getQuizTopics())
                        .status(questionsAdded.getStatus())
                        .questionUpdatedAt(questionsAdded.getUpdatedAt())
                        .contentEntriesCount(questionsAdded.getContentEntriesCount().getValue())
                        .questions(questions)
                        .questionsCount(questions.size());
            }
            case QuizAnswerMarkedDomainEvent answerMarked -> {
                var currentProjection = quizProjectionRepository.findById(quizId);
                var responses = currentProjection != null ? currentProjection.getResponses() : new HashSet<String>();
                responses.add(answerMarked.getQuizQuestionResponse().getQuizQuestion().toString());

                quizProjectionBuilder.responses(responses)
                        .questionsCompleted(responses.size());
            }
            default -> {
            }
        }
        quizProjectionRepository.upsert(quizProjectionBuilder.build());
    }
}