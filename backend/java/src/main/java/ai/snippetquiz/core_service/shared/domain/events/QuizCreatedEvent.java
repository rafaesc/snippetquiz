package ai.snippetquiz.core_service.shared.domain.events;

import ai.snippetquiz.core_service.shared.cqrs.events.BaseEvent;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=false)
@Builder
public class QuizCreatedEvent extends BaseEvent {
    
}
