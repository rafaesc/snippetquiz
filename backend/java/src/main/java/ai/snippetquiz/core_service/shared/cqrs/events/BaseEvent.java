package ai.snippetquiz.core_service.shared.cqrs.events;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import ai.snippetquiz.core_service.shared.cqrs.messages.Message;
import lombok.AllArgsConstructor;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper=false)
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent extends Message {
    private int version;
}
