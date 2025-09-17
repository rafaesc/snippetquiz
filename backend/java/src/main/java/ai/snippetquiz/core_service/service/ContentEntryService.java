package ai.snippetquiz.core_service.service;

import ai.snippetquiz.core_service.dto.request.CreateContentEntryRequest;
import ai.snippetquiz.core_service.dto.request.FindAllContentEntriesRequest;
import ai.snippetquiz.core_service.dto.request.RemoveContentEntryRequest;
import ai.snippetquiz.core_service.dto.response.ContentEntryItemResponse;
import ai.snippetquiz.core_service.dto.response.ContentEntryResponse;
import ai.snippetquiz.core_service.dto.response.PaginatedResponse;
import ai.snippetquiz.core_service.dto.response.PaginationInfo;
import ai.snippetquiz.core_service.entity.ContentBank;
import ai.snippetquiz.core_service.entity.ContentEntry;
import ai.snippetquiz.core_service.entity.ContentEntryBank;
import ai.snippetquiz.core_service.entity.ContentEntryTopic;
import ai.snippetquiz.core_service.entity.ContentType;
import ai.snippetquiz.core_service.entity.YoutubeChannel;
import ai.snippetquiz.core_service.exception.NotFoundException;
import ai.snippetquiz.core_service.repository.ContentEntryRepository;
import ai.snippetquiz.core_service.repository.ContentBankRepository;
import ai.snippetquiz.core_service.repository.ContentEntryBankRepository;
import ai.snippetquiz.core_service.repository.TopicRepository;
import ai.snippetquiz.core_service.repository.YoutubeChannelRepository;
import ai.snippetquiz.core_service.repository.ContentEntryTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ContentEntryService {

    private final ContentEntryRepository contentEntryRepository;
    private final ContentBankRepository contentBankRepository;
    private final ContentEntryBankRepository contentEntryBankRepository;
    private final TopicRepository topicRepository;
    private final YoutubeChannelRepository youtubeChannelRepository;
    private final ContentEntryTopicRepository contentEntryTopicRepository;
    private final KafkaProducerService kafkaProducerService;

    public ContentEntryResponse create(UUID userId, CreateContentEntryRequest request) {
        // Validate content bank ownership
        Long bankId = Long.parseLong(request.bankId());
        ContentBank contentBank = contentBankRepository.findByIdAndUserId(bankId, userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        // Process HTML content if type is FULL_HTML
        String processedContent = request.content();
        ContentType type = ContentType.valueOf(request.type().toUpperCase());
        if (type == ContentType.FULL_HTML && request.content() != null) {
            try {
                // Clean HTML content using JSoup's Safelist (similar to DOMPurify)
                String cleanHtml = Jsoup.clean(request.content(), Safelist.relaxed());
                // Extract plain text from cleaned HTML (similar to Readability)
                processedContent = Jsoup.parse(cleanHtml).text();
            } catch (Exception error) {
                log.error("Error processing HTML content: {}", error.getMessage(), error);
                processedContent = request.content();
            }
        }

        // Handle YouTube channel if provided
        YoutubeChannel youtubeChannel = null;
        if (type == ContentType.VIDEO_TRANSCRIPT && request.youtubeChannelId() != null
                && !request.youtubeChannelId().trim().isEmpty()) {
            youtubeChannel = youtubeChannelRepository.findByChannelId(request.youtubeChannelId())
                    .orElseGet(() -> {
                        YoutubeChannel newChannel = new YoutubeChannel(
                                request.youtubeChannelId(),
                                request.youtubeChannelName(),
                                request.youtubeAvatarUrl());
                        return youtubeChannelRepository.save(newChannel);
                    });
        }

        ContentEntry resultEntry = null;

        // Check for existing entry with same sourceUrl and type 'full_html'
        ContentEntry existingEntry = null;
        if (type == ContentType.FULL_HTML && request.sourceUrl() != null) {
            existingEntry = contentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(
                    request.sourceUrl(), ContentType.FULL_HTML, bankId)
                    .orElse(null);

            if (existingEntry != null) {
                // Update existing entry
                existingEntry.setContent(processedContent);
                existingEntry.setPageTitle(request.pageTitle());
                existingEntry.setCreatedAt(LocalDateTime.now());

                // Calculate word count for FULL_HTML
                if (processedContent != null && !processedContent.trim().isEmpty()) {
                    int wordCount = processedContent.trim().split("\\s+").length;
                    existingEntry.setWordCount(wordCount);
                }

                resultEntry = contentEntryRepository.save(existingEntry);
            }
        }

        // Check for existing VIDEO_TRANSCRIPT entry with same sourceUrl in same bank
        if (type == ContentType.VIDEO_TRANSCRIPT && request.sourceUrl() != null) {
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
            ContentEntry contentEntry = new ContentEntry();
            contentEntry.setUserId(userId);
            contentEntry.setContentType(type);
            contentEntry.setContent(processedContent);
            contentEntry.setSourceUrl(request.sourceUrl());
            contentEntry.setPageTitle(request.pageTitle());
            contentEntry.setQuestionsGenerated(false);

            // Calculate word count for selected_text and full_html content types
            if ((type == ContentType.SELECTED_TEXT || type == ContentType.FULL_HTML) && processedContent != null
                    && !processedContent.trim().isEmpty()) {
                String[] words = processedContent.trim().split("\\s+");
                int wordCount = (int) Arrays.stream(words).filter(word -> !word.isEmpty()).count();
                contentEntry.setWordCount(wordCount);
            }

            // Add YouTube fields for VIDEO_TRANSCRIPT type
            if (type == ContentType.VIDEO_TRANSCRIPT) {
                if (request.youtubeVideoId() != null) {
                    contentEntry.setYoutubeVideoId(request.youtubeVideoId());
                }
                if (request.youtubeVideoDuration() != null) {
                    contentEntry.setVideoDuration(request.youtubeVideoDuration());
                }
                if (youtubeChannel != null) {
                    contentEntry.setYoutubeChannel(youtubeChannel);
                }
            }

            ContentEntry savedEntry = contentEntryRepository.save(contentEntry);

            // Create association with content bank
            ContentEntryBank association = new ContentEntryBank();
            association.setContentEntry(savedEntry);
            association.setContentBank(contentBank);
            contentEntryBankRepository.save(association);

            resultEntry = savedEntry;
        }

        // Generate topics asynchronously (similar to NestJS catch block)
        try {
            this.generateTopicsForContentEntry(userId, resultEntry);
        } catch (Exception error) {
            log.error("Failed to generate topics for content entry {}: {}",
                    Optional.ofNullable(resultEntry).map(ContentEntry::getId).orElse(null), error.getMessage(), error);
        }

        return mapToContentEntryResponse(resultEntry, null);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<ContentEntryItemResponse> findAll(UUID userId, String filterBybankId,
            FindAllContentEntriesRequest request) {
        // Validate content bank ownership
        Long bankId = Long.parseLong(filterBybankId);
        contentBankRepository.findByIdAndUserId(bankId, userId)
                .orElseThrow(() -> new NotFoundException("Content bank not found or does not belong to user"));

        int page = request.getPage() != null ? request.getPage() : 1;
        int limit = request.getLimit() != null ? request.getLimit() : 10;

        // Create pageable with descending order by createdAt
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Get content entries for the bank
        List<ContentEntry> allEntries = contentEntryRepository.findByContentBankId(bankId, pageable);

        // Apply pagination manually since we're using a custom query
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allEntries.size());
        List<ContentEntry> pagedEntries = allEntries.subList(start, end);

        // Map to response DTOs
        List<ContentEntryItemResponse> items = pagedEntries.stream()
                .map(entry -> {
                    List<String> topics = contentEntryTopicRepository.findTopicNamesByContentEntryId(entry.getId());
                    return new ContentEntryItemResponse(
                            entry.getId().toString(),
                            entry.getContentType().getValue(),
                            truncateContent(entry.getContent(), 200),
                            entry.getSourceUrl(),
                            entry.getPageTitle(),
                            entry.getCreatedAt(),
                            entry.getQuestionsGenerated(),
                            topics);
                })
                .collect(Collectors.toList());

        PaginationInfo pagination = new PaginationInfo(page, limit, (long) allEntries.size());
        return new PaginatedResponse<>(items, pagination);
    }

    @Transactional(readOnly = true)
    public ContentEntryResponse findOne(UUID userId, String id) {
        Long entryId = Long.parseLong(id);
        ContentEntry contentEntry = contentEntryRepository.findById(entryId)
                .orElseThrow(() -> new NotFoundException("Content entry not found"));

        // Verify user has access to this content entry through content banks
        List<ContentEntryBank> associations = contentEntryBankRepository.findByContentEntryId(entryId);
        boolean hasAccess = associations.stream()
                .anyMatch(assoc -> assoc.getContentBank().getUserId().equals(userId));

        if (!hasAccess) {
            throw new NotFoundException("Content entry not found or access denied");
        }

        List<String> topics = contentEntryTopicRepository.findTopicNamesByContentEntryId(entryId);
        return mapToContentEntryResponse(contentEntry, topics);
    }

    public ContentEntryResponse clone(UUID userId, String entryId, String cloneTargetBankId) {
        Long sourceId = Long.parseLong(entryId);
        Long targetBankId = Long.parseLong(cloneTargetBankId);

        // Verify source content entry access
        ContentEntry sourceEntry = contentEntryRepository.findById(sourceId)
                .orElseThrow(() -> new NotFoundException("Source content entry not found"));

        List<ContentEntryBank> sourceAssociations = contentEntryBankRepository.findByContentEntryId(sourceId);
        boolean hasSourceAccess = sourceAssociations.stream()
                .anyMatch(assoc -> assoc.getContentBank().getUserId().equals(userId));

        if (!hasSourceAccess) {
            throw new NotFoundException("Source content entry not found or access denied");
        }

        // Verify target content bank ownership
        ContentBank targetBank = contentBankRepository.findByIdAndUserId(targetBankId, userId)
                .orElseThrow(() -> new NotFoundException("Target content bank not found or does not belong to user"));

        // Clone the content entry
        ContentEntry clonedEntry = new ContentEntry();
        clonedEntry.setUserId(userId);
        clonedEntry.setContentType(sourceEntry.getContentType());
        clonedEntry.setContent(sourceEntry.getContent());
        clonedEntry.setSourceUrl(sourceEntry.getSourceUrl());
        clonedEntry.setPageTitle(sourceEntry.getPageTitle());
        clonedEntry.setPromptSummary(sourceEntry.getPromptSummary());
        clonedEntry.setQuestionsGenerated(false); // Reset questions generated flag
        clonedEntry.setWordCount(sourceEntry.getWordCount());
        clonedEntry.setVideoDuration(sourceEntry.getVideoDuration());
        clonedEntry.setYoutubeVideoId(sourceEntry.getYoutubeVideoId());
        clonedEntry.setYoutubeChannel(sourceEntry.getYoutubeChannel());

        ContentEntry savedClone = contentEntryRepository.save(clonedEntry);

        // Create association with target bank
        ContentEntryBank association = new ContentEntryBank();
        association.setContentEntry(savedClone);
        association.setContentBank(targetBank);
        contentEntryBankRepository.save(association);

        // Clone topics
        List<ContentEntryTopic> sourceTopics = contentEntryTopicRepository.findByContentEntryId(sourceId);
        for (ContentEntryTopic sourceTopic : sourceTopics) {
            ContentEntryTopic clonedTopic = new ContentEntryTopic();
            clonedTopic.setContentEntry(savedClone);
            clonedTopic.setTopic(sourceTopic.getTopic());
            contentEntryTopicRepository.save(clonedTopic);
        }

        List<String> topics = sourceTopics.stream()
                .map(ct -> ct.getTopic().getTopic())
                .collect(Collectors.toList());

        return mapToContentEntryResponse(savedClone, topics);
    }

    public void remove(UUID userId, RemoveContentEntryRequest request) {
        Long entryId = Long.parseLong(request.id());

        // Verify user has access to this content entry
        ContentEntry contentEntry = contentEntryRepository.findById(entryId)
                .orElseThrow(() -> new NotFoundException("Content entry not found"));

        List<ContentEntryBank> associations = contentEntryBankRepository.findByContentEntryId(entryId);
        boolean hasAccess = associations.stream()
                .anyMatch(assoc -> assoc.getContentBank().getUserId().equals(userId));

        if (!hasAccess) {
            throw new NotFoundException("Content entry not found or access denied");
        }

        // Delete all associations and topics
        contentEntryBankRepository.deleteByContentEntryId(entryId);
        contentEntryTopicRepository.deleteByContentEntryId(entryId);

        // Delete the content entry
        contentEntryRepository.delete(contentEntry);
    }

    public void generateTopicsForContentEntry(UUID userId, ContentEntry contentEntry) {
        Long entryId = contentEntry.getId();

        // Process topics from request
        var existingTopics = topicRepository.findAllByUserId(userId).stream().map(topic -> topic.getTopic())
                .collect(Collectors.joining(","));

        // Emit Kafka event for topic generation
        try {
            kafkaProducerService.emitGenerateTopicsEvent(userId.toString(), entryId.toString(),
                    contentEntry.getContent(), contentEntry.getPageTitle(), existingTopics);
        } catch (Exception e) {
            // Log error but don't fail the operation
            log.error("Failed to emit Kafka event: " + e.getMessage());
        }
    }

    public ContentEntryResponse updateContentEntry(UUID userId, String id) {
        Long entryId = Long.parseLong(id);

        // Verify user has access to this content entry
        ContentEntry contentEntry = contentEntryRepository.findById(entryId)
                .orElseThrow(() -> new NotFoundException("Content entry not found"));

        List<ContentEntryBank> associations = contentEntryBankRepository.findByContentEntryId(entryId);
        boolean hasAccess = associations.stream()
                .anyMatch(assoc -> assoc.getContentBank().getUserId().equals(userId));

        if (!hasAccess) {
            throw new NotFoundException("Content entry not found or access denied");
        }

        // Update questions generated flag
        contentEntry.setQuestionsGenerated(true);

        return mapToContentEntryResponse(contentEntryRepository.save(contentEntry), null);
    }

    private ContentEntryResponse mapToContentEntryResponse(ContentEntry entry, List<String> topics) {
        return new ContentEntryResponse(
                entry.getId().toString(),
                entry.getContentType().getValue(),
                entry.getContent(),
                entry.getSourceUrl(),
                entry.getPageTitle(),
                entry.getCreatedAt(),
                entry.getQuestionsGenerated(),
                entry.getPromptSummary(),
                topics,
                null // entryCount is not used in single entry response
        );
    }

    private String truncateContent(String content, int maxLength) {
        if (content == null || content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}