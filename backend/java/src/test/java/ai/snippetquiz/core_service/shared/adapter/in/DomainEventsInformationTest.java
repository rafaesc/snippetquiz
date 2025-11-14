package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventsInformation;
import ai.snippetquiz.core_service.testing.events.FirstTestEvent;
import ai.snippetquiz.core_service.testing.events.SecondTestEvent;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DomainEventsInformationTest {

    @Test
    void search_returns_correct_classes_for_multiple_events() {
        DomainEventsInformation info = new DomainEventsInformation();

        Class<?> first = info.search(FirstTestEvent.eventName());
        Class<?> second = info.search(SecondTestEvent.eventName());

        assertEquals(FirstTestEvent.class, first);
        assertEquals(SecondTestEvent.class, second);
    }

    @Test
    void search_throws_for_unknown_event() {
        DomainEventsInformation info = new DomainEventsInformation();

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> info.search("non.existent.event")
        );

        assertTrue(ex.getMessage().contains("No event with eventId"));
    }
}