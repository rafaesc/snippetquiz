package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;

import java.util.UUID;

import ai.snippetquiz.core_service.contentbank.application.dto.request.CreateContentBankRequest;
import ai.snippetquiz.core_service.contentbank.application.dto.request.DuplicateContentBankRequest;
import ai.snippetquiz.core_service.contentbank.application.dto.request.UpdateContentBankRequest;

public interface ContentBankService {
    ContentBankResponse create(UUID userId, CreateContentBankRequest request);
    
    PagedModel<ContentBankItemResponse> findAll(UUID userId, String name, Pageable pageable);

    ContentBankResponse findOne(UUID userId, Long id);

    ContentBankResponse update(UUID userId, Long id, UpdateContentBankRequest request);
    
    void remove(UUID userId, Long id);

    ContentBankResponse duplicate(UUID userId, Long id, DuplicateContentBankRequest request);
}
