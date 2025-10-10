package ai.snippetquiz.core_service.quiz.adapter.out.entities;

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

import java.util.List;

@Entity
@Table(name = "quiz_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "type", nullable = false)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_entry_type", nullable = false)
    private ContentType contentEntryType;

    @Column(name = "content_entry_source_url")
    private String contentEntrySourceUrl;

    @Column(name = "chunk_index")
    private Integer chunkIndex;

    @Column(name = "question_index_in_chunk")
    private Integer questionIndexInChunk;

    @Column(name = "content_entry_id")
    private Long contentEntryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private QuizEntity quiz;

    @OneToMany(mappedBy = "quizQuestion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionOptionEntity> quizQuestionOptions;

    @OneToMany(mappedBy = "quizQuestion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionResponseEntity> quizQuestionResponses;

    public QuizQuestionEntity(String question, String type, ContentType contentEntryType, String contentEntrySourceUrl,
                              Integer chunkIndex, Integer questionIndexInChunk, Long contentEntryId, QuizEntity quiz) {
        this.question = question;
        this.type = type;
        this.contentEntryType = contentEntryType;
        this.contentEntrySourceUrl = contentEntrySourceUrl;
        this.chunkIndex = chunkIndex;
        this.questionIndexInChunk = questionIndexInChunk;
        this.contentEntryId = contentEntryId;
        this.quiz = quiz;
    }
}