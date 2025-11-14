package ai.snippetquiz.core_service.shared.domain.entity;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Setter
@Getter
@EqualsAndHashCode
@NoArgsConstructor
@SuperBuilder
public abstract class BaseEntity<ID> {
    private ID id;
}
