package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.adapter.in.web.request.CreateContentEntryRequest;
import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.ContentEntryResponse;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;

import java.util.UUID;

public interface ContentEntryService {
    ContentEntryResponse create(UUID userId, CreateContentEntryRequest request);

    ContentEntryDTOResponse findById(UUID userId, Long entryId);
    
    PagedModel<ContentEntryDTOResponse> findAll(UUID userId, UUID bankId, String name, Pageable pageable);

    ContentEntryResponse clone(UUID userId, Long entryId, UUID cloneTargetBankId);
    
    void remove(UUID userId, Long entryId);
}
