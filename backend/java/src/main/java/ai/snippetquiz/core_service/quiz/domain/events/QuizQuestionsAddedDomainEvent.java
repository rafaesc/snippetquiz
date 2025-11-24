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
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toSet;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class QuizQuestionsAddedDomainEvent extends DomainEvent {
    private Set<String> quizTopics;
    private QuizStatus status;
    private LocalDateTime updatedAt;
    private ContentEntryCount contentEntriesCount;
    private List<QuizQuestion> quizQuestions;

    public QuizQuestionsAddedDomainEvent(
            UUID aggregateId,
            UserId userId,
            Set<String> quizTopics,
            QuizStatus status,
            LocalDateTime updatedAt,
            ContentEntryCount contentEntriesCount,
            List<QuizQuestion> quizQuestions) {
        super(aggregateId, userId.getValue());
        this.quizTopics = quizTopics;
        this.status = status;
        this.updatedAt = updatedAt;
        this.contentEntriesCount = contentEntriesCount;
        this.quizQuestions = quizQuestions;
    }

    public QuizQuestionsAddedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            Set<String> quizTopics,
            QuizStatus status,
            LocalDateTime updatedAt,
            ContentEntryCount contentEntriesCount,
            List<QuizQuestion> quizQuestions) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.quizTopics = quizTopics;
        this.status = status;
        this.updatedAt = updatedAt;
        this.contentEntriesCount = contentEntriesCount;
        this.quizQuestions = quizQuestions;
    }

    public static String eventName() {
        return "quiz.questions.added";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        var primitives = new HashMap<String, Object>();
        primitives.put("quiz_topics", quizTopics);
        primitives.put("status", status);
        primitives.put("updated_at", Utils.dateToString(updatedAt));
        primitives.put("content_entries_count", Utils.toMap(contentEntriesCount));
        primitives.put("quiz_questions", quizQuestions.stream().map(Utils::toMap).toList());
        return primitives;
    }

    @Override
    public QuizQuestionsAddedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new QuizQuestionsAddedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                Utils.getMapper().convertValue(body.get("quiz_topics"), new TypeReference<Set<String>>() {
                }),
                QuizStatus.valueOf((String) body.get("status")),
                Utils.stringToDate((String) body.get("updated_at")),
                Utils.getMapper().convertValue(body.get("content_entries_count"), ContentEntryCount.class),
                Utils.getMapper().convertValue(body.get("quiz_questions"), new TypeReference<List<QuizQuestion>>() {
                }));
    }
}
