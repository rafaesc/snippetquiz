package ai.snippetquiz.core_service.contentbank.domain.port;

import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

public interface ContentEntryEventPublisher {
    void emitGenerateTopicsEvent(UserId userId, Long contentId, String content, String pageTitle, String existingTopics);
}
