package ai.snippetquiz.core_service.service;

import ai.snippetquiz.core_service.dto.request.*;
import ai.snippetquiz.core_service.dto.response.*;
import ai.snippetquiz.core_service.entity.*;
import ai.snippetquiz.core_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ai.snippetquiz.core_service.exception.NotFoundException;
import ai.snippetquiz.core_service.exception.ConflictException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContentBankService {

    private final ContentBankRepository contentBankRepository;
    private final ContentEntryRepository contentEntryRepository;
    private final ContentEntryBankRepository contentEntryBankRepository;

    public ContentBankResponse create(UUID userId, CreateContentBankRequest request) {
        var name = request.name();

        // Check if user already has a content bank with this name
        var existingBank = contentBankRepository.findByUserIdAndName(userId, name.trim());
        if (existingBank.isPresent()) {
            throw new ConflictException("A content bank with this name already exists");
        }

        // Create new content bank
        var contentBank = new ContentBank();
        contentBank.setUserId(userId);
        contentBank.setName(name.trim());
        contentBank.setCreatedAt(LocalDateTime.now());
        contentBank.setUpdatedAt(LocalDateTime.now());

        var savedBank = contentBankRepository.save(contentBank);

        return new ContentBankResponse(
                savedBank.getId(),
                savedBank.getName(),
                userId.toString(),
                savedBank.getCreatedAt(),
                savedBank.getUpdatedAt(),
                0);
    }

    @Transactional(readOnly = true)
    public PagedModel<ContentBankItemResponse> findAll(UUID userId, String name, Pageable pageable) {

        var contentBanksPage = contentBankRepository.findByUserIdAndNameContainingIgnoreCase(
                userId, name, pageable);

        var contentBankItems = contentBanksPage.map(bank -> {
            long entryCount = contentEntryRepository.countByContentBankId(bank.getId());
            return new ContentBankItemResponse(
                    bank.getId(),
                    bank.getName(),
                    bank.getUserId().toString(),
                    bank.getCreatedAt(),
                    bank.getUpdatedAt(),
                    (int) entryCount);
        });

        return new PagedModel<>(contentBankItems);
    }

    @Transactional(readOnly = true)
    public ContentBankResponse findOne(UUID userId, String id) {
        var contentBank = contentBankRepository.findByIdAndUserId(Long.parseLong(id), userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or does not belong to user"));

        var entryCount = contentEntryRepository.countByContentBankId(contentBank.getId());

        return new ContentBankResponse(
                contentBank.getId(),
                contentBank.getName(),
                contentBank.getUserId().toString(),
                contentBank.getCreatedAt(),
                contentBank.getUpdatedAt(),
                (int) entryCount);
    }

    public ContentBankResponse update(UUID userId, String id, UpdateContentBankRequest request) {
        var name = request.name();

        var existingBank = contentBankRepository.findByIdAndUserId(Long.parseLong(id), userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or does not belong to user"));

        if (Objects.nonNull(name) && !name.trim().isEmpty()) {
            var duplicateBank = contentBankRepository.findByUserIdAndNameAndIdNot(
                    userId, name.trim(), Long.parseLong(id));

            if (duplicateBank.isPresent()) {
                throw new ConflictException("A content bank with this name already exists");
            }

            existingBank.setName(name.trim());
        }

        existingBank.setUpdatedAt(LocalDateTime.now());
        var updatedBank = contentBankRepository.save(existingBank);

        return new ContentBankResponse(
                updatedBank.getId(),
                updatedBank.getName(),
                updatedBank.getUserId().toString(),
                updatedBank.getCreatedAt(),
                updatedBank.getUpdatedAt(),
                null);
    }

    public void remove(UUID userId, String id) {
        contentBankRepository.deleteByIdAndUserId(Long.parseLong(id), userId);
    }

    public ContentBankResponse duplicate(UUID userId, String id, DuplicateContentBankRequest request) {
        String newName = request.name();

        var originalBank = contentBankRepository.findByIdAndUserId(Long.parseLong(id), userId)
                .orElseThrow(() -> new NotFoundException(
                        "Content bank not found or does not belong to user"));

        var finalName = (Objects.nonNull(newName) && !newName.trim().isEmpty())
                ? newName.trim()
                : "Copy of " + originalBank.getName();

        var existingBank = contentBankRepository.findByUserIdAndName(userId, finalName);
        if (existingBank.isPresent()) {
            throw new ConflictException("A content bank with this name already exists");
        }

        return duplicateContentBankWithEntries(originalBank, userId, finalName);
    }

    private ContentBankResponse duplicateContentBankWithEntries(ContentBank originalBank, UUID userId,
            String newName) {
        var newBank = new ContentBank();
        newBank.setUserId(userId);
        newBank.setName(newName);
        newBank.setCreatedAt(LocalDateTime.now());
        newBank.setUpdatedAt(LocalDateTime.now());

        newBank = contentBankRepository.save(newBank);

        var contentEntryAssociations = contentEntryBankRepository
                .findByContentBankId(originalBank.getId());

        for (ContentEntryBank association : contentEntryAssociations) {
            var newAssociation = new ContentEntryBank();
            newAssociation.setContentEntry(association.getContentEntry());
            newAssociation.setContentBank(newBank);
            contentEntryBankRepository.save(newAssociation);
        }

        return new ContentBankResponse(
                newBank.getId(),
                newBank.getName(),
                newBank.getUserId().toString(),
                newBank.getCreatedAt(),
                newBank.getUpdatedAt(),
                null);
    }
}