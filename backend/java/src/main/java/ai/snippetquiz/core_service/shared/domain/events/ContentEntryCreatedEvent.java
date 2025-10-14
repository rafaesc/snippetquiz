package ai.snippetquiz.core_service.shared.domain.events;

import ai.snippetquiz.core_service.shared.cqrs.events.BaseEvent;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper=false)
@SuperBuilder
public class ContentEntryCreatedEvent extends BaseEvent {
    
}
