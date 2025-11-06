package ai.snippetquiz.core_service.question.domain;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionContentEntryChunkId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionContentEntryQuestionChunkId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionId;
import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonSerialize
public class Question extends BaseEntity<QuestionId> {
    private String question;
    private String type;
    private QuestionContentEntryChunkId chunkIndex;
    private QuestionContentEntryQuestionChunkId questionIndexInChunk;
    private ContentEntryId contentEntryId;
    private LocalDateTime createdAt;
    private List<QuestionOption> questionOptions = List.of();
}