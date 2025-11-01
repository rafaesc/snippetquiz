package ai.snippetquiz.core_service.quiz.domain.events;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;

import ai.snippetquiz.core_service.question.domain.Question;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class QuizQuestionGeneratedDomainEvent extends DomainEvent {
    private final List<Question> questions;

    public QuizQuestionGeneratedDomainEvent(
            String aggregateId, List<Question> questions) {
        super(aggregateId);
        this.questions = questions;
    }

    public QuizQuestionGeneratedDomainEvent(String aggregateId, String eventId, String occurredOn,
            List<Question> questions) {
        super(aggregateId, eventId, occurredOn);
        this.questions = questions;
    }

    @Override
    public String eventName() {
        return "quiz.question_generated";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("questions", Question.toJson(questions));
        return primitives;
    }

    @Override
    public QuizQuestionGeneratedDomainEvent fromPrimitives(String aggregateId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new QuizQuestionGeneratedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                Question.fromJson((String) body.get("questions")));
    }
}
