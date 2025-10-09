package ai.snippetquiz.core_service.contentbank.domain.port.in;

import ai.snippetquiz.core_service.contentbank.application.dto.request.CreateContentEntryRequest;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentEntryResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;

import java.util.UUID;

public interface ContentEntryService {
    ContentEntryResponse create(UUID userId, CreateContentEntryRequest request);

    ContentEntryDTOResponse findById(UUID userId, Long entryId);
    
    PagedModel<ContentEntryDTOResponse> findAll(UUID userId, Long bankId, String name, Pageable pageable);

    ContentEntryResponse clone(UUID userId, Long entryId, Long cloneTargetBankId);
    
    void remove(UUID userId, Long entryId);
}
