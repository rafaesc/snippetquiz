package ai.snippetquiz.core_service.shared.domain.entity;

import lombok.Setter;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Setter
@Getter
@EqualsAndHashCode
public abstract class BaseEntity<ID> {
    private ID id;
}
