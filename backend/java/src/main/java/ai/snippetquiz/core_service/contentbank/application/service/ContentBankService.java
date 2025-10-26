package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.ContentBankResponse;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Pageable;

public interface ContentBankService {
    void create(ContentBankId id, UserId userId, String name);
    
    PagedModelResponse<ContentBankItemResponse> findAll(UserId userId, String name, Pageable pageable);

    ContentBankResponse findOne(UserId userId, ContentBankId id);
    
    void remove(UserId userId, ContentBankId id);

    void duplicate(UserId userId, ContentBankId id, String name);
}
