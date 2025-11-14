package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class QuizAnswerMarkedDomainEvent extends DomainEvent {
    private QuizQuestionResponse quizQuestionResponse;
    private boolean isAllQuestionsMarked;

    public QuizAnswerMarkedDomainEvent(
            String aggregateId,
            UserId userId,
            QuizQuestionResponse quizQuestionResponse,
            boolean isAllQuestionsMarked) {
        super(aggregateId, userId.toString());
        this.quizQuestionResponse = quizQuestionResponse;
        this.isAllQuestionsMarked = isAllQuestionsMarked;
    }

    public QuizAnswerMarkedDomainEvent(
            String aggregateId,
            UserId userId,
            String eventId,
            String occurredOn,
            int version,
            QuizQuestionResponse quizQuestionResponse,
            boolean isAllQuestionsMarked) {
        super(aggregateId, userId.toString(), eventId, occurredOn, version);
        this.quizQuestionResponse = quizQuestionResponse;
        this.isAllQuestionsMarked = isAllQuestionsMarked;
    }


    public static String eventName() {
        return "quiz.answer.marked";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("quiz_question_response", Utils.toJson(quizQuestionResponse));
        primitives.put("is_all_questions_marked", isAllQuestionsMarked);
        return primitives;
    }

    @Override
    public QuizAnswerMarkedDomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn,
            int version) {
        return new QuizAnswerMarkedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                version,
                Utils.fromJson((String) body.get("quiz_question_response"), QuizQuestionResponse.class),
                (boolean) body.get("is_all_questions_marked"));
    }
}
