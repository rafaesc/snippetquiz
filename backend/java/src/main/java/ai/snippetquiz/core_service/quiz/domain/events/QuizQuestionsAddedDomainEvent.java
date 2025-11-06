package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.ContentEntryCount;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

@Getter
@EqualsAndHashCode(callSuper = true)
public class QuizQuestionsAddedDomainEvent extends DomainEvent {
    private final Set<String> quizTopics;
    private final QuizStatus status;
    private final LocalDateTime updatedAt;
    private final ContentEntryCount contentEntriesCount;
    private final List<QuizQuestion> quizQuestions;


    public QuizQuestionsAddedDomainEvent(
            String aggregateId,
            UserId userId,
            java.util.Set<String> quizTopics,
            QuizStatus status,
            java.time.LocalDateTime updatedAt,
            ContentEntryCount contentEntriesCount,
            java.util.List<QuizQuestion> quizQuestions) {
        super(aggregateId, userId.toString());
        this.quizTopics = quizTopics;
        this.status = status;
        this.updatedAt = updatedAt;
        this.contentEntriesCount = contentEntriesCount;
        this.quizQuestions = quizQuestions;
    }

    public QuizQuestionsAddedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn,
                                         java.util.Set<String> quizTopics,
                                         QuizStatus status,
                                         java.time.LocalDateTime updatedAt,
                                         ContentEntryCount contentEntriesCount,
                                         java.util.List<QuizQuestion> quizQuestions) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
        this.quizTopics = quizTopics;
        this.status = status;
        this.updatedAt = updatedAt;
        this.contentEntriesCount = contentEntriesCount;
        this.quizQuestions = quizQuestions;
    }

    @Override
    public String eventName() {
        return "quiz.questions.added";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("quizTopics", Utils.toJson(quizTopics));
        primitives.put("status", status);
        primitives.put("updatedAt", updatedAt);
        primitives.put("contentEntriesCount", Utils.toJson(contentEntriesCount));
        primitives.put("quizQuestionIds", Utils.toJson(quizQuestions));
        return primitives;
    }

    @Override
    public QuizQuestionsAddedDomainEvent fromPrimitives(String aggregateId, String userId, HashMap<String, Serializable> body,
                                                        String eventId,
                                                        String occurredOn) {
        return new QuizQuestionsAddedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                Utils.fromJson((String) body.get("quizTopics"), new TypeReference<Set<String>>() {
                }),
                (QuizStatus) body.get("status"),
                (LocalDateTime) body.get("updatedAt"),
                Utils.fromJson((String) body.get("contentEntriesCount"), ContentEntryCount.class),
                Utils.fromJson((String) body.get("quizQuestions"), new TypeReference<List<QuizQuestion>>() {
                }));
    }
}
