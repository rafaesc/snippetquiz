package ai.snippetquiz.core_service.contentbank.domain.port;

public interface ContentEntryEventPublisher {
    void emitGenerateTopicsEvent(String userId, Long contentId, String content, String pageTitle, String existingTopics);
}
