package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "content_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    private YoutubeChannel youtubeChannel;

    @OneToMany(mappedBy = "contentEntry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;

    @OneToMany(mappedBy = "contentEntry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContentEntryBank> contentEntryBanks;

    @OneToMany(mappedBy = "contentEntry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContentEntryTopic> contentEntryTopics;

    @OneToMany(mappedBy = "contentEntry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestion> quizQuestions;

    public ContentEntry(ContentType contentType, String content, String sourceUrl, String pageTitle) {
        this.contentType = contentType;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.pageTitle = pageTitle;
    }
}