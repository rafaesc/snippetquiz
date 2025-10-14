package ai.snippetquiz.core_service.contentbank.adapter.out.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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
public class ContentBankEntity {
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

    @OneToMany(mappedBy = "contentBank")
    private List<ContentEntryBankEntity> contentEntryBanks;

    @ManyToMany
    @JoinTable(
        name = "content_entries_bank",
        joinColumns = @JoinColumn(name = "content_bank_id"),
        inverseJoinColumns = @JoinColumn(name = "content_entry_id")
    )
    private List<ContentEntryEntity> contentEntries;

    public ContentBankEntity(UUID userId, String name) {
        this.userId = userId;
        this.name = name;
    }
}