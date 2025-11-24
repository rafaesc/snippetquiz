package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.model.YoutubeChannel;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.YoutubeChannelRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ContentEntryServiceImpl implements ContentEntryService {

        private final ContentEntryRepository contentEntryRepository;
        private final ContentBankRepository contentBankRepository;
        private final ContentEntryTopicRepository contentEntryTopicRepository;
        private final YoutubeChannelRepository youtubeChannelRepository;
        private final TopicRepository topicRepository;
        private final EventBus eventBus;

        @Override
        public void create(UserId userId,
                        String sourceUrl,
                        String content,
                        String contentType,
                        String pageTitle,
                        ContentBankId bankId,
                        String youtubeVideoId,
                        Integer youtubeVideoDuration,
                        String youtubeChannelId,
                        String youtubeChannelName,
                        String youtubeAvatarUrl) {
                var contentBank = contentBankRepository.findByIdAndUserId(bankId, userId)
                                .orElseThrow(() -> new NotFoundException(
                                                "Content bank not found or does not belong to user"));

                // Process HTML content if type is FULL_HTML
                var processedContent = content;
                var type = ContentType.fromValue(contentType);

                if (ContentType.FULL_HTML.equals(type)) {
                        processedContent = content.trim();
                }

                // Handle YouTube channel if provided
                YoutubeChannel youtubeChannel = null;
                if (ContentType.VIDEO_TRANSCRIPT.equals(type) && Objects.nonNull(youtubeChannelId)
                                && !youtubeChannelId.trim().isEmpty()) {
                        youtubeChannel = youtubeChannelRepository.findByChannelId(youtubeChannelId)
                                        .orElseGet(() -> {
                                                var newChannel = new YoutubeChannel(
                                                                youtubeChannelId,
                                                                youtubeChannelName,
                                                                youtubeAvatarUrl);
                                                return youtubeChannelRepository.save(newChannel);
                                        });
                }

                // Check for existing entry with same sourceUrl and type 'full_html'
                ContentEntry existingEntry = null;
                if (ContentType.FULL_HTML.equals(type) && Objects.nonNull(sourceUrl)) {
                        existingEntry = contentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(
                                        sourceUrl, ContentType.FULL_HTML, bankId)
                                        .orElse(null);

                        if (Objects.nonNull(existingEntry)) {
                                // Update existing entry
                                existingEntry.update(processedContent, pageTitle);
                                contentEntryRepository.save(existingEntry);
                                return;
                        }
                }

                // Check for existing VIDEO_TRANSCRIPT entry with same sourceUrl in same bank
                if (ContentType.VIDEO_TRANSCRIPT.equals(type) && Objects.nonNull(sourceUrl)) {
                        existingEntry = contentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(
                                        sourceUrl, ContentType.VIDEO_TRANSCRIPT, bankId)
                                        .orElse(null);

                        // If VIDEO_TRANSCRIPT entry already exists, return it without creating/updating
                        if (Objects.nonNull(existingEntry)) {
                                return;
                        }
                }

                // Create new entry
                var contentEntry = new ContentEntry(userId, bankId, type, processedContent, sourceUrl, pageTitle,
                                youtubeVideoDuration, youtubeVideoId, youtubeChannel);

                var savedEntry = contentEntryRepository.save(contentEntry);
                eventBus.publish(contentEntry.aggregateType(), contentEntry.drainDomainEvents());

                contentBank.addContentEntry(savedEntry);
                eventBus.publish(contentBank.aggregateType(), contentBank.drainDomainEvents());
        }

        @Override
        @Transactional(readOnly = true)
        public ContentEntryDTOResponse findById(UserId userId, ContentEntryId entryId) {
                var contentEntry = contentEntryRepository.findByIdAndUserId(entryId, userId)
                                .orElseThrow(() -> new NotFoundException(
                                                "Content entry not found or access denied " + entryId.toString()));

                var contentEntryTopicList = contentEntryTopicRepository.findByContentEntryId(contentEntry.getId());
                var topicIds = contentEntryTopicList.stream()
                                .map(ContentEntryTopic::getTopicId)
                                .collect(Collectors.toList());
                var topics = topicRepository.findAllByIdInAndUserId(topicIds, userId);

                return new ContentEntryDTOResponse(
                                contentEntry.getId().toString(),
                                contentEntry.getContentType().getValue(),
                                truncateContent(contentEntry.getContent(), 200),
                                contentEntry.getSourceUrl(),
                                contentEntry.getPageTitle(),
                                contentEntry.getCreatedAt(),
                                contentEntry.getQuestionsGenerated(),
                                topics.stream().map(Topic::getTopic).toList());
        }

        @Override
        @Transactional(readOnly = true)
        public PagedModelResponse<ContentEntryDTOResponse> findAll(UserId userId, ContentBankId bankId, String name,
                        Pageable pageable) {
                contentBankRepository.findByIdAndUserId(bankId, userId)
                                .orElseThrow(() -> new NotFoundException(
                                                "Content bank not found or does not belong to user"));

                var entriesPage = contentEntryRepository.findByContentBankId(bankId, pageable);

                var contentEntryDTOPage = entriesPage.map(entry -> {
                        var contentEntryTopicList = contentEntryTopicRepository.findByContentEntryId(entry.getId());
                        var topicIds = contentEntryTopicList.stream()
                                        .map(ContentEntryTopic::getTopicId)
                                        .toList();
                        var topics = topicRepository.findAllByIdInAndUserId(topicIds, userId);
                        return new ContentEntryDTOResponse(
                                        entry.getId().toString(),
                                        entry.getContentType().getValue(),
                                        truncateContent(entry.getContent(), 200),
                                        entry.getSourceUrl(),
                                        entry.getPageTitle(),
                                        entry.getCreatedAt(),
                                        entry.getQuestionsGenerated(),
                                        topics.stream().map(Topic::getTopic).toList());
                });

                return new PagedModelResponse<>(contentEntryDTOPage);
        }

        @Override
        public void clone(UserId userId, ContentEntryId entryId, ContentBankId cloneTargetBankId) {
                var sourceEntry = contentEntryRepository.findByIdAndUserId(entryId, userId)
                                .orElseThrow(() -> new NotFoundException(
                                                "Source content entry not found or access denied"));

                var targetBank = contentBankRepository.findByIdAndUserId(cloneTargetBankId, userId)
                                .orElseThrow(() -> new NotFoundException(
                                                "Target content bank not found or does not belong to user"));

                var clonedEntry = new ContentEntry(sourceEntry, targetBank.getId());

                contentEntryRepository.save(clonedEntry);

                var sourceTopics = contentEntryTopicRepository.findByContentEntryId(entryId);
                var topicIds = new ArrayList<TopicId>();
                for (ContentEntryTopic sourceTopic : sourceTopics) {
                        var clonedTopic = new ContentEntryTopic();
                        clonedTopic.setContentEntryId(clonedEntry.getId());
                        clonedTopic.setTopicId(sourceTopic.getTopicId());
                        topicIds.add(sourceTopic.getTopicId());
                        contentEntryTopicRepository.save(clonedTopic);
                }

                var topics = topicRepository.findAllByIdInAndUserId(topicIds, userId);
                clonedEntry.updatedTopics(topics);
                eventBus.publish(clonedEntry.aggregateType(), clonedEntry.drainDomainEvents());

                targetBank.addContentEntry(clonedEntry);
                eventBus.publish(targetBank.aggregateType(), targetBank.drainDomainEvents());
        }

        @Override
        public void remove(UserId userId, ContentEntryId entryId) {
                var contentEntry = contentEntryRepository.findByIdAndUserId(entryId, userId)
                                .orElseThrow(() -> new NotFoundException("Content entry not found or access denied"));
                var contentBank = contentBankRepository.findByIdAndUserId(contentEntry.getContentBankId(), userId)
                                .orElseThrow(() -> new NotFoundException(
                                                "Content bank not found or does not belong to user"));

                contentEntry.delete();
                contentBank.removeContentEntry(contentEntry);

                contentEntryRepository.delete(contentEntry);
                eventBus.publish(contentEntry.aggregateType(), contentEntry.drainDomainEvents());
        }

        private String truncateContent(String content, int maxLength) {
                if (Objects.isNull(content) || content.length() <= maxLength) {
                        return content;
                }
                return content.substring(0, maxLength) + "...";
        }
}
