package ai.snippetquiz.core_service.contentbank.adapter.out.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "content_entries_bank", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"content_entry_id", "content_bank_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentEntryBankEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_entry_id", nullable = false)
    private ContentEntryEntity contentEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_bank_id", nullable = false)
    private ContentBankEntity contentBank;

    public ContentEntryBankEntity(ContentEntryEntity contentEntry, ContentBankEntity contentBank) {
        this.contentEntry = contentEntry;
        this.contentBank = contentBank;
    }
}