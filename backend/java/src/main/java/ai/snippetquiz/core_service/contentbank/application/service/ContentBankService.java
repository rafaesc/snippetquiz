package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankResponse;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;

public interface ContentBankService {
    void create(ContentBankId id, UserId userId, String name);
    
    PagedModel<ContentBankItemResponse> findAll(UserId userId, String name, Pageable pageable);

    ContentBankResponse findOne(UserId userId, ContentBankId id);

    void update(UserId userId, ContentBankId id, String name);
    
    void remove(UserId userId, ContentBankId id);

    void duplicate(UserId userId, ContentBankId id, String name);
}
