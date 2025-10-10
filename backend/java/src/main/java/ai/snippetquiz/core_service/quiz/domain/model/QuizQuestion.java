package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.shared.domain.ContentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {
    private Long id;
    private String question;
    private String type;
    private ContentType contentEntryType;
    private String contentEntrySourceUrl;
    private Integer chunkIndex;
    private Integer questionIndexInChunk;
    private Long contentEntryId;
    private Quiz quiz;
    private List<QuizQuestionOption> quizQuestionOptions;
    private List<QuizQuestionResponse> quizQuestionResponses;

    public QuizQuestion(String question, String type, ContentType contentEntryType, String contentEntrySourceUrl, 
                       Integer chunkIndex, Integer questionIndexInChunk, Long contentEntryId, Quiz quiz) {
        this.question = question;
        this.type = type;
        this.contentEntryType = contentEntryType;
        this.contentEntrySourceUrl = contentEntrySourceUrl;
        this.chunkIndex = chunkIndex;
        this.questionIndexInChunk = questionIndexInChunk;
        this.contentEntryId = contentEntryId;
        this.quiz = quiz;
    }
}