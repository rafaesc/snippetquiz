package ai.snippetquiz.core_service.service;

import ai.snippetquiz.core_service.dto.request.*;
import ai.snippetquiz.core_service.dto.response.*;
import ai.snippetquiz.core_service.entity.*;
import ai.snippetquiz.core_service.repository.*;
import lombok.AllArgsConstructor;
import ai.snippetquiz.core_service.exception.NotFoundException;
import ai.snippetquiz.core_service.exception.ConflictException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@AllArgsConstructor
@Transactional
public class ContentBankService {

    private final ContentBankRepository contentBankRepository;

    private final ContentEntryRepository contentEntryRepository;

    private final ContentEntryBankRepository contentEntryBankRepository;

    public ContentBankResponse create(UUID userId, CreateContentBankRequest request) {
        String name = request.name();

        // Check if user already has a content bank with this name
        Optional<ContentBank> existingBank = contentBankRepository.findByUserIdAndName(userId, name.trim());
        if (existingBank.isPresent()) {
            throw new ConflictException("A content bank with this name already exists");
        }

        // Create new content bank
        ContentBank contentBank = new ContentBank();
        contentBank.setUserId(userId);
        contentBank.setName(name.trim());
        contentBank.setCreatedAt(LocalDateTime.now());
        contentBank.setUpdatedAt(LocalDateTime.now());

        ContentBank savedBank = contentBankRepository.save(contentBank);

        return new ContentBankResponse(
                savedBank.getId(),
                savedBank.getName(),
                userId.toString(),
                savedBank.getCreatedAt(),
                savedBank.getUpdatedAt(),
                0 // entry_count starts at 0
        );
    }

    @Transactional(readOnly = true)
    public PaginatedContentBanksResponse findAll(UUID userId, FindAllContentBanksRequest request) {
        int page = request.page() != null ? request.page() : 1;
        int limit = request.limit() != null ? request.limit() : 10;
        String name = request.name();

        // Create pageable with descending order by createdAt
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Find content banks with pagination and filtering
        Page<ContentBank> contentBanksPage = contentBankRepository.findByUserIdAndNameContainingIgnoreCase(
                userId, name, pageable);

        // Map to response DTOs with entry counts
        List<ContentBankItemResponse> contentBankItems = contentBanksPage.getContent().stream()
                .map(bank -> {
                    long entryCount = contentEntryRepository.countByContentBankId(bank.getId());
                    return new ContentBankItemResponse(
                            bank.getId(),
                            bank.getName(),
                            bank.getUserId().toString(),
                            bank.getCreatedAt(),
                            bank.getUpdatedAt(),
                            (int) entryCount);
                })
                .collect(Collectors.toList());

        PaginationInfo pagination = new PaginationInfo(
                page,
                limit,
                contentBanksPage.getTotalElements());

        return new PaginatedContentBanksResponse(contentBankItems, pagination);
    }

    @Transactional(readOnly = true)
    public ContentBankResponse findOne(UUID userId, String id) {
        ContentBank contentBank = contentBankRepository.findByIdAndUserId(Long.parseLong(id), userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        long entryCount = contentEntryRepository.countByContentBankId(contentBank.getId());

        return new ContentBankResponse(
                contentBank.getId(),
                contentBank.getName(),
                contentBank.getUserId().toString(),
                contentBank.getCreatedAt(),
                contentBank.getUpdatedAt(),
                (int) entryCount);
    }

    public ContentBankResponse update(UUID userId, String id, UpdateContentBankRequest request) {
        String name = request.name();

        // Check if the content bank exists and belongs to the user
        ContentBank existingBank = contentBankRepository.findByIdAndUserId(Long.parseLong(id), userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        // Check if user already has another content bank with this name
        if (name != null && !name.trim().isEmpty()) {
            Optional<ContentBank> duplicateBank = contentBankRepository.findByUserIdAndNameExcludingId(
                    userId, name.trim(), Long.parseLong(id));

            if (duplicateBank.isPresent()) {
                throw new ConflictException("A content bank with this name already exists");
            }

            existingBank.setName(name.trim());
        }

        existingBank.setUpdatedAt(LocalDateTime.now());
        ContentBank updatedBank = contentBankRepository.save(existingBank);

        return new ContentBankResponse(
                updatedBank.getId(),
                updatedBank.getName(),
                updatedBank.getUserId().toString(),
                updatedBank.getCreatedAt(),
                updatedBank.getUpdatedAt(),
                null // Don't include entry count in update response
        );
    }

    public DeleteResponse remove(UUID userId, String id) {
        // Check if the content bank exists and belongs to the user
        ContentBank contentBank = contentBankRepository.findByIdAndUserId(Long.parseLong(id), userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        // Delete the content bank (cascade should handle related entities)
        contentBankRepository.delete(contentBank);

        return new DeleteResponse("Content bank deleted successfully");
    }

    public ContentBankResponse duplicate(UUID userId, String id, DuplicateContentBankRequest request) {
        String newName = request.name();

        // Check if the original content bank exists and belongs to the user
        ContentBank originalBank = contentBankRepository.findByIdAndUserId(Long.parseLong(id), userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        // Generate new name if not provided
        String finalName = (newName != null && !newName.trim().isEmpty())
                ? newName.trim()
                : "Copy of " + originalBank.getName();

        // Check if user already has a content bank with this name
        Optional<ContentBank> existingBank = contentBankRepository.findByUserIdAndName(userId, finalName);
        if (existingBank.isPresent()) {
            throw new ConflictException("A content bank with this name already exists");
        }

        return duplicateContentBankWithEntries(originalBank, userId, finalName);
    }

    private ContentBankResponse duplicateContentBankWithEntries(ContentBank originalBank, UUID userId, String newName) {
        // Create the new content bank
        ContentBank newBank = new ContentBank();
        newBank.setUserId(userId);
        newBank.setName(newName);
        newBank.setCreatedAt(LocalDateTime.now());
        newBank.setUpdatedAt(LocalDateTime.now());

        ContentBank savedNewBank = contentBankRepository.save(newBank);

        // Get all content entries associated with the original bank
        List<ContentEntryBank> contentEntryAssociations = contentEntryBankRepository
                .findByContentBankId(originalBank.getId());

        // Duplicate each content entry and its associations
        for (ContentEntryBank association : contentEntryAssociations) {
            // Associate the new content entry with the new bank
            ContentEntryBank newAssociation = new ContentEntryBank();
            newAssociation.setContentEntry(association.getContentEntry());
            newAssociation.setContentBank(savedNewBank);
            contentEntryBankRepository.save(newAssociation);
        }

        return new ContentBankResponse(
                savedNewBank.getId(),
                savedNewBank.getName(),
                savedNewBank.getUserId().toString(),
                savedNewBank.getCreatedAt(),
                savedNewBank.getUpdatedAt(),
                null // Don't include entry count in duplicate response
        );
    }
}