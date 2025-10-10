package ai.snippetquiz.core_service.question.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    private Long id;
    private String question;
    private String type;
    private Integer chunkIndex;
    private Integer questionIndexInChunk;
    private Long contentEntryId;
    private LocalDateTime createdAt;
    private List<QuestionOption> questionOptions;

    public Question(String question, String type, Integer chunkIndex, Integer questionIndexInChunk, Long contentEntryId) {
        this.question = question;
        this.type = type;
        this.chunkIndex = chunkIndex;
        this.questionIndexInChunk = questionIndexInChunk;
        this.contentEntryId = contentEntryId;
    }
}