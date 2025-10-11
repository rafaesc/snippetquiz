package ai.snippetquiz.core_service.contentbank.adapter.out.entities;

import ai.snippetquiz.core_service.shared.domain.ContentType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "content_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentEntryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "youtube_channel_id")
    private YoutubeChannelEntity youtubeChannel;

    @OneToMany(mappedBy = "contentEntry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContentEntryBankEntity> contentEntryBanks;

    @OneToMany(mappedBy = "contentEntry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContentEntryTopicEntity> contentEntryTopics;

    public ContentEntryEntity(ContentType contentType, String content, String sourceUrl, String pageTitle) {
        this.contentType = contentType;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.pageTitle = pageTitle;
    }
}