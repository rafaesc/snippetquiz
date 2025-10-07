package ai.snippetquiz.core_service.before.entity;

import jakarta.persistence.*;
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
public class YoutubeChannel {
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
    private List<ContentEntry> contentEntries;

    public YoutubeChannel(String channelId, String channelName, String avatarUrl) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.avatarUrl = avatarUrl;
    }
}