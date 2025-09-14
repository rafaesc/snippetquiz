package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "quiz_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_entry_id")
    private ContentEntry contentEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @OneToMany(mappedBy = "quizQuestion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionOption> quizQuestionOptions;

    @OneToMany(mappedBy = "quizQuestion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizQuestionResponse> quizQuestionResponses;

    public QuizQuestion(String question, String type, ContentType contentEntryType, String contentEntrySourceUrl, ContentEntry contentEntry, Quiz quiz) {
        this.question = question;
        this.type = type;
        this.contentEntryType = contentEntryType;
        this.contentEntrySourceUrl = contentEntrySourceUrl;
        this.contentEntry = contentEntry;
        this.quiz = quiz;
    }
}