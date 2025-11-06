package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionContentEntryChunkId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionContentEntryQuestionChunkId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
public class QuizQuestion {
    private QuizQuestionId id;
    private QuestionContentEntryChunkId chunkIndex;
    private QuestionContentEntryQuestionChunkId questionIndexInChunk;
    private String question;
    private String type;
    private ContentType contentEntryType;
    private String contentEntrySourceUrl;
    private ContentEntryId contentEntryId;
    private Set<QuizQuestionOption> quizQuestionOptions;

    public QuizQuestion() {
        this.id = new QuizQuestionId(UUID.randomUUID());
        this.quizQuestionOptions =  new HashSet<>();
    }
}