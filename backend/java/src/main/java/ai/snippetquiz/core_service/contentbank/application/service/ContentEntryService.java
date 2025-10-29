package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Pageable;

public interface ContentEntryService {
    void create(UserId userId,
            String sourceUrl,
            String content,
            String type,
            String pageTitle,
            ContentBankId bankId,
            String youtubeVideoId,
            Integer youtubeVideoDuration,
            String youtubeChannelId,
            String youtubeChannelName,
            String youtubeAvatarUrl);

    ContentEntryDTOResponse findById(UserId userId, ContentEntryId entryId);

    PagedModelResponse<ContentEntryDTOResponse> findAll(UserId userId, ContentBankId bankId, String name, Pageable pageable);

    void clone(UserId userId, ContentEntryId entryId, ContentBankId cloneTargetBankId);

    void remove(UserId userId, ContentEntryId entryId);
}
