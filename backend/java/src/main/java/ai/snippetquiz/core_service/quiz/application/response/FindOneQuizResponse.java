package ai.snippetquiz.core_service.quiz.application.response;

import java.time.LocalDateTime;
import java.util.List;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class FindOneQuizResponse implements Response {
    private String id;
    private String name;
    private LocalDateTime createdAt;
    private Integer totalQuestions;
    private Integer questionsCompleted;
    private String status;
    private Integer contentEntriesCount;
    private List<String> topics;
    private QuizQuestionDTOResponse question;
}
