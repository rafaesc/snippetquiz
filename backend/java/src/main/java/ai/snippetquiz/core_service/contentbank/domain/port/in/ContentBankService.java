package ai.snippetquiz.core_service.contentbank.domain.port.in;

import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;

import java.util.UUID;

public interface ContentBankService {
    ContentBankResponse create(UUID userId, String name);
    
    PagedModel<ContentBankItemResponse> findAll(UUID userId, String name, Pageable pageable);

    ContentBankResponse findOne(UUID userId, Long id);

    ContentBankResponse update(UUID userId, Long id, String name);
    
    void remove(UUID userId, Long id);

    ContentBankResponse duplicate(UUID userId, Long id, String newName);
}
