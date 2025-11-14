package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Set;


@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@SuperBuilder
public class QuizProjection extends BaseEntity<QuizId> {
    private UserId userId;
    private ContentBankId contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;
    private Integer contentEntriesCount;
    private Integer questionsCount;
    private Integer questionsCompleted;
    private LocalDateTime questionUpdatedAt;
    private Set<String> topics;
    private Set<String> questions;
    private Set<String> responses;
}