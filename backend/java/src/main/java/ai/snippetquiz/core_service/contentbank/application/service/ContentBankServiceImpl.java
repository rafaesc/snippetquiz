package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.dto.request.DuplicateContentBankRequest;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentBankResponse;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.ConflictException;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContentBankServiceImpl implements ContentBankService {

    private final ContentBankRepository contentBankRepository;
    private final ContentEntryRepository contentEntryRepository;
    private final ContentEntryBankRepository contentEntryBankRepository;

    @Override
    public void create(ContentBankId id, UserId userId, String name) {
        var existingBank = contentBankRepository.findByUserIdAndNameAndIdNot(userId, name.trim(), id);
        if (existingBank.isPresent()) {
            throw new ConflictException("A content bank with this name already exists");
        }

        ContentBank contentBank;
        var existingById = contentBankRepository.findById(id);
        if (existingById.isPresent()) {
            var ownerId = existingById.get().getUserId();
            if (!ownerId.equals(userId)) {
                throw new ConflictException("Content bank ID belongs to another user");
            }
            contentBank = existingById.get();
        } else {
            contentBank = ContentBank.create(id, userId, name);
        }

        contentBank.setName(name.trim());
        contentBank.setUpdatedAt(LocalDateTime.now());

        contentBankRepository.save(contentBank);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedModel<ContentBankItemResponse> findAll(UserId userId, String name, Pageable pageable) {
        var contentBanksPage = contentBankRepository.findByUserIdAndNameContainingIgnoreCase(
                userId, name, pageable);

        var contentBankItems = contentBanksPage.map(bank -> {
            long entryCount = contentEntryRepository.countByContentBankId(bank.getId().getValue());
            return new ContentBankItemResponse(
                    bank.getId().getValue(),
                    bank.getName(),
                    bank.getUserId().toString(),
                    bank.getCreatedAt(),
                    bank.getUpdatedAt(),
                    (int) entryCount);
        });

        return new PagedModel<>(contentBankItems);
    }

    @Override
    @Transactional(readOnly = true)
    public ContentBankResponse findOne(UserId userId, ContentBankId id) {
        var contentBank = contentBankRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or does not belong to user"));

        var entryCount = contentEntryRepository.countByContentBankId(contentBank.getId().getValue());

        return new ContentBankResponse(
                contentBank.getId().getValue(),
                contentBank.getName(),
                contentBank.getUserId().toString(),
                contentBank.getCreatedAt(),
                contentBank.getUpdatedAt(),
                (int) entryCount);
    }

    @Override
    public void update(UserId userId, ContentBankId id, String name) {
        var existingBank = contentBankRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or does not belong to user"));

        if (Objects.nonNull(name) && !name.trim().isEmpty()) {
            var duplicateBank = contentBankRepository.findByUserIdAndNameAndIdNot(
                    userId, name.trim(), id);

            if (duplicateBank.isPresent()) {
                throw new ConflictException("A content bank with this name already exists");
            }

            existingBank.setName(name.trim());
        }

        existingBank.setUpdatedAt(LocalDateTime.now());
        contentBankRepository.save(existingBank);
    }

    @Override
    @Transactional
    public void remove(UserId userId, ContentBankId id) {
        contentBankRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or access denied"));
        
        contentBankRepository.deleteByIdAndUserId(id, userId);
    }

    @Override
    public void duplicate(UserId userId, ContentBankId id, String name) {
        var newName = name;

        var originalBank = contentBankRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or does not belong to user"));

        var finalName = (Objects.nonNull(newName) && !newName.trim().isEmpty())
                ? newName.trim()
                : "Copy of " + originalBank.getName();

        var existingBank = contentBankRepository.findByUserIdAndName(userId, finalName);
        if (existingBank.isPresent()) {
            throw new ConflictException("A content bank with this name already exists");
        }

        duplicateContentBankWithEntries(originalBank, userId, finalName);
    }

    private void duplicateContentBankWithEntries(ContentBank originalBank, UserId userId, String newName) {
        var newBank = new ContentBank();
        newBank.setUserId(userId);
        newBank.setName(newName);
        newBank.setCreatedAt(LocalDateTime.now());
        newBank.setUpdatedAt(LocalDateTime.now());

        newBank = contentBankRepository.save(newBank);

        var contentEntryAssociations = contentEntryBankRepository
                .findByContentBankId(originalBank.getId().getValue());

        for (ContentEntryBank association : contentEntryAssociations) {
            var newAssociation = new ContentEntryBank();
            newAssociation.setContentEntry(association.getContentEntry());
            newAssociation.setContentBank(newBank);
            contentEntryBankRepository.save(newAssociation);
        }
    }
}
