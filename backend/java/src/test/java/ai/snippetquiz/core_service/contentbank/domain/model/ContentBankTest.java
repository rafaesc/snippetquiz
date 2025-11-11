package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankDeletedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankEntriesUpdatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankRenamedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContentBankTest {

    private ContentBank newContentBank(UUID bankUuid, UUID userUuid) {
        return new ContentBank(
                ContentBankId.map(bankUuid.toString()),
                UserId.map(userUuid.toString()),
                "Test Bank");
    }

    @Test
    void constructor_recordsCreatedEvent_and_appliesInitialState() {
        var bankUuid = UUID.randomUUID();
        var userUuid = UUID.randomUUID();

        var contentBank = newContentBank(bankUuid, userUuid);

        assertNotNull(contentBank.getId());
        assertEquals(bankUuid, contentBank.getId().getValue());
        assertEquals(userUuid, contentBank.getUserId().getValue());
        assertEquals("Test Bank", contentBank.getName());
        assertNotNull(contentBank.getCreatedAt());
        assertNotNull(contentBank.getUpdatedAt());
        assertEquals(contentBank.getCreatedAt(), contentBank.getUpdatedAt());
        assertNotNull(contentBank.getContentEntries());
        assertTrue(contentBank.getContentEntries().isEmpty());

        var events = contentBank.getUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(ContentBankCreatedDomainEvent.class, events.getFirst());
    }

    @Test
    void rename_recordsEvent_and_updatesName() {
        var contentBank = newContentBank(UUID.randomUUID(), UUID.randomUUID());
        contentBank.markChangesAsCommitted();

        contentBank.rename("New Name");

        assertEquals("New Name", contentBank.getName());
        assertNotNull(contentBank.getUpdatedAt());

        var events = contentBank.getUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(ContentBankRenamedDomainEvent.class, events.getFirst());
    }

    @Test
    void delete_recordsEvent_and_deactivates() {
        var contentBank = newContentBank(UUID.randomUUID(), UUID.randomUUID());
        contentBank.markChangesAsCommitted();

        contentBank.delete();

        var events = contentBank.getUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(ContentBankDeletedDomainEvent.class, events.getFirst());

        assertThrows(IllegalStateException.class, () -> contentBank.rename("Should fail"));
    }

    @Test
    void updatedContentEntries_recordsEvent_and_updatesEntries() {
        var contentBank = newContentBank(UUID.randomUUID(), UUID.randomUUID());
        contentBank.markChangesAsCommitted();

        List<ContentEntry> entries = new ArrayList<>();
        entries.add(new ContentEntry());
        contentBank.updatedContentEntries(entries);

        assertEquals(1, contentBank.getContentEntries().size());
        assertNotNull(contentBank.getUpdatedAt());

        var events = contentBank.getUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(ContentBankEntriesUpdatedDomainEvent.class, events.getFirst());
    }

    @Test
    void addContentEntry_recordsEvent_and_addsEntry() {
        var contentBank = newContentBank(UUID.randomUUID(), UUID.randomUUID());
        contentBank.markChangesAsCommitted();

        contentBank.addContentEntry(new ContentEntry());

        assertEquals(1, contentBank.getContentEntries().size());
        assertNotNull(contentBank.getUpdatedAt());

        var events = contentBank.getUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(ContentBankEntriesUpdatedDomainEvent.class, events.getFirst());
    }

    @Test
    void removeContentEntry_recordsEvent_and_removesEntry() {
        var contentBank = newContentBank(UUID.randomUUID(), UUID.randomUUID());
        var entry = new ContentEntry();
        
        List<ContentEntry> initialEntries = new ArrayList<>();
        initialEntries.add(entry);
        contentBank.updatedContentEntries(initialEntries);
        contentBank.markChangesAsCommitted();

        contentBank.removeContentEntry(entry);

        assertTrue(contentBank.getContentEntries().isEmpty());
        assertNotNull(contentBank.getUpdatedAt());

        var events = contentBank.getUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(ContentBankEntriesUpdatedDomainEvent.class, events.getFirst());
    }
}