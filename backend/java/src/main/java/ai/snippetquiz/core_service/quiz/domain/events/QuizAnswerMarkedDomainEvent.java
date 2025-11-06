package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.io.Serializable;
import java.util.HashMap;

@Getter
@EqualsAndHashCode(callSuper = true)
public class QuizAnswerMarkedDomainEvent extends DomainEvent {
    private final QuizQuestionResponse quizQuestionResponse;
    private final boolean isAllQuestionsMarked;

    public QuizAnswerMarkedDomainEvent(
            String aggregateId,
            UserId userId,
            QuizQuestionResponse quizQuestionResponse,
            boolean isAllQuestionsMarked) {
        super(aggregateId, userId.toString());
        this.quizQuestionResponse = quizQuestionResponse;
        this.isAllQuestionsMarked = isAllQuestionsMarked;
    }

    public QuizAnswerMarkedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn,
                                       QuizQuestionResponse quizQuestionResponse,
                                       boolean isAllQuestionsMarked) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
        this.quizQuestionResponse = quizQuestionResponse;
        this.isAllQuestionsMarked = isAllQuestionsMarked;
    }

    @Override
    public String eventName() {
        return "quiz.answer.marked";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("quizQuestionResponse", Utils.toJson(quizQuestionResponse));
        primitives.put("isAllQuestionsMarked", isAllQuestionsMarked);
        return primitives;
    }

    @Override
    public QuizAnswerMarkedDomainEvent fromPrimitives(String aggregateId, String userId, java.util.HashMap<String, java.io.Serializable> body,
                                                      String eventId,
                                                      String occurredOn) {
        return new QuizAnswerMarkedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                Utils.fromJson((String) body.get("quizQuestionResponse"), QuizQuestionResponse.class),
                (boolean) body.get("isAllQuestionsMarked"));
    }
}
