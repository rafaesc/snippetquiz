package ai.snippetquiz.core_service.contentbank.adapter.out.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "youtube_channels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class YoutubeChannelEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_id", nullable = false, unique = true)
    private String channelId;

    @Column(name = "channel_name", nullable = false)
    private String channelName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "youtubeChannel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContentEntryEntity> contentEntries;

    public YoutubeChannelEntity(String channelId, String channelName, String avatarUrl) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.avatarUrl = avatarUrl;
    }
}