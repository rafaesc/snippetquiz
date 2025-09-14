package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "content_banks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentBank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false)
    private String name;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "contentBank", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Quiz> quizzes;

    @OneToMany(mappedBy = "contentBank", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContentEntryBank> contentEntryBanks;

    @ManyToMany
    @JoinTable(
        name = "content_entries_bank",
        joinColumns = @JoinColumn(name = "content_bank_id"),
        inverseJoinColumns = @JoinColumn(name = "content_entry_id")
    )
    private List<ContentEntry> contentEntries;

    public ContentBank(UUID userId, String name) {
        this.userId = userId;
        this.name = name;
    }
}