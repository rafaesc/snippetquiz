package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "chunk_index")
    private Integer chunkIndex;

    @Column(name = "question_index_in_chunk")
    private Integer questionIndexInChunk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_entry_id", nullable = false)
    private ContentEntry contentEntry;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuestionOption> questionOptions;

    public Question(String question, String type, Integer chunkIndex, Integer questionIndexInChunk, ContentEntry contentEntry) {
        this.question = question;
        this.type = type;
        this.chunkIndex = chunkIndex;
        this.questionIndexInChunk = questionIndexInChunk;
        this.contentEntry = contentEntry;
    }
}