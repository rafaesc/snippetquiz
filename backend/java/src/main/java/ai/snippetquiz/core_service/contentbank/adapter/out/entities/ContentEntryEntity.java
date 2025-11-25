package ai.snippetquiz.core_service.contentbank.adapter.out.entities;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryStatus;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentEntryEntity {
    @Id
    private UUID id;

    @Column(name = "content_bank_id", nullable = false)
    private UUID contentBankId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContentEntryStatus status;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "page_title")
    private String pageTitle;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "prompt_summary", columnDefinition = "TEXT")
    private String promptSummary;

    @Column(name = "questions_generated", nullable = false)
    private Boolean questionsGenerated = false;

    @Column(name = "word_count")
    private Integer wordCount;

    @Column(name = "video_duration")
    private Integer videoDuration;

    @Column(name = "youtube_video_id")
    private String youtubeVideoId;

    @Column(name = "youtube_channel_id")
    private Long youtubeChannelId;
}