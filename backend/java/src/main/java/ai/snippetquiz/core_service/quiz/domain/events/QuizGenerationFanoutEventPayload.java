package ai.snippetquiz.core_service.quiz.domain.events;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonSerialize
public class QuizGenerationFanoutEventPayload {
    
    private Completed completed;
    private Progress progress;
    
    @Data
    @Builder
    @JsonSerialize
    public static class Completed {
        private Long quizId;
    }
    
    @Data
    @Builder
    @JsonSerialize
    public static class Progress {
        private Long quizId;
        private Long bankId;
        private Integer totalContentEntries;
        private Integer totalContentEntriesSkipped;
        private Integer currentContentEntryIndex;
        private Integer questionsGeneratedSoFar;
        private ContentEntry contentEntry;
        private Integer totalChunks;
        private Integer currentChunkIndex;
        
        @Data
        @Builder
        @JsonSerialize
        public static class ContentEntry {
            private Long id;
            private String name;
            private Integer wordCountAnalyzed;
        }
    }
}