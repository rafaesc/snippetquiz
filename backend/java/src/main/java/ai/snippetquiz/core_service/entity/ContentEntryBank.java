package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
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
public class ContentEntryBank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_entry_id", nullable = false)
    private ContentEntry contentEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_bank_id", nullable = false)
    private ContentBank contentBank;

    public ContentEntryBank(ContentEntry contentEntry, ContentBank contentBank) {
        this.contentEntry = contentEntry;
        this.contentBank = contentBank;
    }
}