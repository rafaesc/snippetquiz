package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.ContentEntryResponse;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Pageable;

public interface ContentEntryService {
    ContentEntryResponse create(UserId userId,
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

    ContentEntryDTOResponse findById(UserId userId, Long entryId);

    PagedModelResponse<ContentEntryDTOResponse> findAll(UserId userId, ContentBankId bankId, String name, Pageable pageable);

    ContentEntryResponse clone(UserId userId, Long entryId, ContentBankId cloneTargetBankId);

    void remove(UserId userId, Long entryId);
}
