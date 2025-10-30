package ai.snippetquiz.core_service.question.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionId;
import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Question extends BaseEntity<QuestionId> {
    private String question;
    private String type;
    private Integer chunkIndex;
    private Integer questionIndexInChunk;
    private ContentEntryId contentEntryId;
    private LocalDateTime createdAt;
    private List<QuestionOption> questionOptions = List.of();

    public Question(String question, String type, Integer chunkIndex, Integer questionIndexInChunk, ContentEntryId contentEntryId) {
        this.question = question;
        this.type = type;
        this.chunkIndex = chunkIndex;
        this.questionIndexInChunk = questionIndexInChunk;
        this.contentEntryId = contentEntryId;
    }
}