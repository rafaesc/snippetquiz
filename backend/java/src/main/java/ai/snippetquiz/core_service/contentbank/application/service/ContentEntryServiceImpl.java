package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.dto.request.CreateContentEntryRequest;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentEntryResponse;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentType;
import ai.snippetquiz.core_service.contentbank.domain.model.YoutubeChannel;
import ai.snippetquiz.core_service.contentbank.domain.port.in.ContentEntryService;
import ai.snippetquiz.core_service.contentbank.domain.port.out.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.out.ContentEntryBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.out.ContentEntryEventPublisher;
import ai.snippetquiz.core_service.contentbank.domain.port.out.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.out.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.out.YoutubeChannelRepository;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ContentEntryServiceImpl implements ContentEntryService {

    private final ContentEntryRepository contentEntryRepository;
    private final ContentBankRepository contentBankRepository;
    private final ContentEntryBankRepository contentEntryBankRepository;
    private final ContentEntryTopicRepository contentEntryTopicRepository;
    private final YoutubeChannelRepository youtubeChannelRepository;
    private final ContentEntryEventPublisher contentEntryEventPublisher;

    @Override
    public ContentEntryResponse create(UUID userId, CreateContentEntryRequest request) {
        var bankId = request.bankId();
        var contentBank = contentBankRepository.findByIdAndUserId(bankId, userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        // Process HTML content if type is FULL_HTML
        var processedContent = request.content();
        var type = ContentType.fromValue(request.type());

        if (ContentType.FULL_HTML.equals(type)) {
            processedContent = request.content().trim();
        }

        // Handle YouTube channel if provided
        YoutubeChannel youtubeChannel = null;
        if (ContentType.VIDEO_TRANSCRIPT.equals(type) && Objects.nonNull(request.youtubeChannelId())
                && !request.youtubeChannelId().trim().isEmpty()) {
            youtubeChannel = youtubeChannelRepository.findByChannelId(request.youtubeChannelId())
                    .orElseGet(() -> {
                        var newChannel = new YoutubeChannel(
                                request.youtubeChannelId(),
                                request.youtubeChannelName(),
                                request.youtubeAvatarUrl());
                        return youtubeChannelRepository.save(newChannel);
                    });
        }

        ContentEntry resultEntry = null;

        // Check for existing entry with same sourceUrl and type 'full_html'
        ContentEntry existingEntry = null;
        if (ContentType.FULL_HTML.equals(type) && Objects.nonNull(request.sourceUrl())) {
            existingEntry = contentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(
                            request.sourceUrl(), ContentType.FULL_HTML, bankId)
                    .orElse(null);

            if (Objects.nonNull(existingEntry)) {
                // Update existing entry
                existingEntry.setContent(processedContent);
                existingEntry.setPageTitle(request.pageTitle());
                existingEntry.setCreatedAt(LocalDateTime.now());

                // Calculate word count for FULL_HTML
                if (Objects.nonNull(processedContent) && !processedContent.trim().isEmpty()) {
                    int wordCount = processedContent.trim().split("\\s+").length;
                    existingEntry.setWordCount(wordCount);
                }

                resultEntry = contentEntryRepository.save(existingEntry);
            }
        }

        // Check for existing VIDEO_TRANSCRIPT entry with same sourceUrl in same bank
        if (ContentType.VIDEO_TRANSCRIPT.equals(type) && Objects.nonNull(request.sourceUrl())) {
            existingEntry = contentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(
                            request.sourceUrl(), ContentType.VIDEO_TRANSCRIPT, bankId)
                    .orElse(null);

            // If VIDEO_TRANSCRIPT entry already exists, return it without creating/updating
            if (existingEntry != null) {
                resultEntry = existingEntry;
            }
        }

        if (existingEntry == null) {
            // Create new entry
            var contentEntry = new ContentEntry();
            contentEntry.setUserId(userId);
            contentEntry.setContentType(type);
            contentEntry.setContent(processedContent);
            contentEntry.setSourceUrl(request.sourceUrl());
            contentEntry.setPageTitle(request.pageTitle());
            contentEntry.setQuestionsGenerated(false);

            // Calculate word count for selected_text and full_html content types
            if ((ContentType.SELECTED_TEXT.equals(type) || ContentType.FULL_HTML.equals(type))
                    && Objects.nonNull(processedContent)
                    && !processedContent.trim().isEmpty()) {
                var words = processedContent.trim().split("\\s+");
                var wordCount = (int) Arrays.stream(words).filter(word -> !word.isEmpty()).count();
                contentEntry.setWordCount(wordCount);
            }

            // Add YouTube fields for VIDEO_TRANSCRIPT type
            if (ContentType.VIDEO_TRANSCRIPT.equals(type)) {
                if (Objects.nonNull(request.youtubeVideoId())) {
                    contentEntry.setYoutubeVideoId(request.youtubeVideoId());
                }
                if (Objects.nonNull(request.youtubeVideoDuration())) {
                    contentEntry.setVideoDuration(request.youtubeVideoDuration());
                }
                if (Objects.nonNull(youtubeChannel)) {
                    contentEntry.setYoutubeChannel(youtubeChannel);
                }
            }

            var savedEntry = contentEntryRepository.save(contentEntry);

            // Create association with content bank
            var association = new ContentEntryBank();
            association.setContentEntry(savedEntry);
            association.setContentBank(contentBank);
            contentEntryBankRepository.save(association);

            resultEntry = savedEntry;
        }

        try {
            this.generateTopicsForContentEntry(userId, resultEntry);
        } catch (Exception error) {
            log.error("Failed to generate topics for content entry {}: {}",
                    Optional.ofNullable(resultEntry).map(ContentEntry::getId).orElse(null), error.getMessage(), error);
        }

        return mapToContentEntryResponse(resultEntry, null);
    }

    @Override
    @Transactional(readOnly = true)
    public ContentEntryDTOResponse findById(UUID userId, Long entryId) {
        var contentEntry = contentEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new NotFoundException("Content entry not found or access denied"));

        var topics = contentEntryTopicRepository.findTopicNamesByContentEntryId(contentEntry.getId());

        return new ContentEntryDTOResponse(
                contentEntry.getId(),
                contentEntry.getContentType().getValue(),
                truncateContent(contentEntry.getContent(), 200),
                contentEntry.getSourceUrl(),
                contentEntry.getPageTitle(),
                contentEntry.getCreatedAt(),
                contentEntry.getQuestionsGenerated(),
                topics);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedModel<ContentEntryDTOResponse> findAll(UUID userId, Long bankId, String name, Pageable pageable) {
        contentBankRepository.findByIdAndUserId(bankId, userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        var entriesPage = contentEntryRepository.findByContentEntryBanks_ContentBank_Id(bankId, pageable);

        var contentEntryDTOPage = entriesPage.map(entry -> {
            var topics = contentEntryTopicRepository.findTopicNamesByContentEntryId(entry.getId());
            return new ContentEntryDTOResponse(
                    entry.getId(),
                    entry.getContentType().getValue(),
                    truncateContent(entry.getContent(), 200),
                    entry.getSourceUrl(),
                    entry.getPageTitle(),
                    entry.getCreatedAt(),
                    entry.getQuestionsGenerated(),
                    topics);
        });

        return new PagedModel<>(contentEntryDTOPage);
    }

    @Override
    public ContentEntryResponse clone(UUID userId, Long entryId, Long cloneTargetBankId) {
        var sourceEntry = contentEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new NotFoundException("Source content entry not found or access denied"));

        var targetBank = contentBankRepository.findByIdAndUserId(cloneTargetBankId, userId)
                .orElseThrow(() -> new NotFoundException("Target content bank not found or does not belong to user"));

        var clonedEntry = new ContentEntry();
        clonedEntry.setUserId(userId);
        clonedEntry.setContentType(sourceEntry.getContentType());
        clonedEntry.setContent(sourceEntry.getContent());
        clonedEntry.setSourceUrl(sourceEntry.getSourceUrl());
        clonedEntry.setPageTitle(sourceEntry.getPageTitle());
        clonedEntry.setPromptSummary(sourceEntry.getPromptSummary());
        clonedEntry.setQuestionsGenerated(false);
        clonedEntry.setWordCount(sourceEntry.getWordCount());
        clonedEntry.setVideoDuration(sourceEntry.getVideoDuration());
        clonedEntry.setYoutubeVideoId(sourceEntry.getYoutubeVideoId());
        clonedEntry.setYoutubeChannel(sourceEntry.getYoutubeChannel());

        var savedClone = contentEntryRepository.save(clonedEntry);

        var association = new ContentEntryBank();
        association.setContentEntry(savedClone);
        association.setContentBank(targetBank);
        contentEntryBankRepository.save(association);

        var sourceTopics = contentEntryTopicRepository.findByContentEntryId(entryId);
        for (ContentEntryTopic sourceTopic : sourceTopics) {
            var clonedTopic = new ContentEntryTopic();
            clonedTopic.setContentEntry(savedClone);
            clonedTopic.setTopicId(sourceTopic.getTopicId());
            contentEntryTopicRepository.save(clonedTopic);
        }

        var topics = sourceTopics.stream()
                .map(ct -> ct.getTopic().getTopic())
                .collect(Collectors.toList());

        return mapToContentEntryResponse(savedClone, topics);
    }

    @Override
    public void remove(UUID userId, Long entryId) {
        var contentEntry = contentEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new NotFoundException("Content entry not found or access denied"));

        contentEntryBankRepository.deleteByContentEntryId(entryId);
        contentEntryTopicRepository.deleteByContentEntryId(entryId);

        contentEntryRepository.delete(contentEntry);
    }

    private void generateTopicsForContentEntry(UUID userId, ContentEntry contentEntry) {
        Long entryId = contentEntry.getId();

        var existingTopics = contentEntryTopicRepository.findTopicNamesByContentEntryId(entryId).stream()
                .collect(Collectors.joining(","));

        try {
            contentEntryEventPublisher.emitGenerateTopicsEvent(userId.toString(), entryId,
                    contentEntry.getContent(), contentEntry.getPageTitle(), existingTopics);
        } catch (Exception e) {
            log.error("Failed to emit Kafka event: " + e.getMessage());
        }
    }

    private ContentEntryResponse mapToContentEntryResponse(ContentEntry entry, List<String> topics) {
        return new ContentEntryResponse(
                entry.getId(),
                entry.getContentType().getValue(),
                entry.getContent(),
                entry.getSourceUrl(),
                entry.getPageTitle(),
                entry.getCreatedAt(),
                entry.getQuestionsGenerated(),
                entry.getPromptSummary(),
                topics,
                null);
    }

    private String truncateContent(String content, int maxLength) {
        if (Objects.isNull(content) || content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}
