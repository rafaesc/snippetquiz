package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.AbstractIntegrationTest;
import ai.snippetquiz.core_service.CoreServiceApplication;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.adapter.out.PostgresqlContainerBase;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CoreServiceApplication.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class JpaQuizProjectionProjectionRepositoryAdapterIT extends AbstractIntegrationTest {
    @Autowired
    private JpaQuizProjectionProjectionRepositoryAdapter adapter;

    @Test
    void upsertAndFindById_persistsAndReadsProjection() {
        var id = QuizId.map(UUID.randomUUID().toString());
        var userId = UserId.map(UUID.randomUUID().toString());
        var bankId = ContentBankId.map(UUID.randomUUID().toString());

        var topics = Set.of("topic-1", "topic-2");
        var questions = Set.of(UUID.randomUUID().toString(), UUID.randomUUID().toString());

        var projection = QuizProjection.builder()
                .id(id)
                .userId(userId)
                .contentBankId(bankId)
                .bankName("Bank A")
                .status(QuizStatus.IN_PROGRESS)
                .createdAt(LocalDateTime.now())
                .contentEntriesCount(7)
                .questionsCount(2)
                .questionsCompleted(1)
                .questionUpdatedAt(LocalDateTime.now())
                .topics(topics)
                .questions(questions)
                .responses(Set.of())
                .build();

        adapter.upsert(projection);

        var found = adapter.findById(id);
        assertNotNull(found);
        assertEquals(id, found.getId());
        assertEquals(userId, found.getUserId());
        assertEquals(bankId, found.getContentBankId());
        assertEquals("Bank A", found.getBankName());
        assertEquals(QuizStatus.IN_PROGRESS, found.getStatus());
        assertEquals(7, found.getContentEntriesCount());
        assertEquals(2, found.getQuestionsCount());
        assertEquals(1, found.getQuestionsCompleted());
        assertEquals(topics, found.getTopics());
        assertEquals(questions, found.getQuestions());
    }

    @Test
    void findAllByUserIdAndStatus_returnsSavedProjection() {
        var id = QuizId.map(UUID.randomUUID().toString());
        var userId = UserId.map(UUID.randomUUID().toString());
        var bankId = ContentBankId.map(UUID.randomUUID().toString());

        var projection = QuizProjection.builder()
                .id(id)
                .userId(userId)
                .contentBankId(bankId)
                .bankName("Bank B")
                .status(QuizStatus.IN_PROGRESS)
                .topics(Set.of())
                .questions(Set.of())
                .responses(Set.of())
                .build();

        adapter.upsert(projection);

        var list = adapter.findAllByUserIdAndStatus(userId, QuizStatus.IN_PROGRESS);
        assertFalse(list.isEmpty());
        assertTrue(list.stream().anyMatch(p -> p.getId().equals(id)));
    }

    @Test
    void findByUserIdOrderByCreatedAtDesc_returnsPage() {
        var userId = UserId.map(UUID.randomUUID().toString());

        // save two projections for the same user
        var p1 = QuizProjection.builder()
                .id(QuizId.map(UUID.randomUUID().toString()))
                .userId(userId)
                .bankName("Bank C1")
                .status(QuizStatus.PREPARE)
                .topics(Set.of())
                .questions(Set.of())
                .responses(Set.of())
                .build();
        adapter.upsert(p1);

        var p2 = QuizProjection.builder()
                .id(QuizId.map(UUID.randomUUID().toString()))
                .userId(userId)
                .bankName("Bank C2")
                .status(QuizStatus.PREPARE)
                .topics(Set.of())
                .questions(Set.of())
                .responses(Set.of())
                .build();
        adapter.upsert(p2);

        var page = adapter.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 10));
        assertNotNull(page);
        assertTrue(page.hasContent());
        assertTrue(page.getContent().size() >= 2);
    }

    @Test
    void deleteById_removesProjection() {
        var id = QuizId.map(UUID.randomUUID().toString());
        var userId = UserId.map(UUID.randomUUID().toString());

        var projection = QuizProjection.builder()
                .id(id)
                .userId(userId)
                .bankName("Bank D")
                .status(QuizStatus.PREPARE)
                .topics(Set.of())
                .questions(Set.of())
                .responses(Set.of())
                .build();

        adapter.upsert(projection);

        var found = adapter.findById(id);
        assertNotNull(found);

        adapter.deleteById(id);

        var afterDelete = adapter.findById(id);
        assertNull(afterDelete);
    }
}