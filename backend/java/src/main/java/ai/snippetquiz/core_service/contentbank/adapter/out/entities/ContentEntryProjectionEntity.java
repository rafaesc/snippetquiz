package ai.snippetquiz.core_service.contentbank.adapter.out.entities;

import ai.snippetquiz.core_service.shared.domain.ContentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_entries__projection")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentEntryProjectionEntity {
    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(name = "content", length = 300)
    private String content;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(name = "page_title")
    private String pageTitle;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "questions_generated", nullable = false)
    private Boolean questionsGenerated = false;

    @Column(name = "topics", columnDefinition = "JSONB")
    private String topics;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "content_banks_id", nullable = false)
    private UUID contentBanksId;
}