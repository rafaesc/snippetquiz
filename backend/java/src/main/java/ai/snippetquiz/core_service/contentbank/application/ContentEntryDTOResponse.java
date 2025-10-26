package ai.snippetquiz.core_service.contentbank.application;

import java.time.LocalDateTime;
import java.util.List;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ContentEntryDTOResponse implements Response {
    private String id;
    private String contentType;
    private String content; // truncated to 300 chars
    private String sourceUrl;
    private String pageTitle;
    private LocalDateTime createdAt;
    private Boolean questionsGenerated;
    private List<String> topics;
}
