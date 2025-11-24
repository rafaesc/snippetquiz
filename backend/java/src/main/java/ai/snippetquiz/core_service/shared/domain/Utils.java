package ai.snippetquiz.core_service.shared.domain;

import ai.snippetquiz.core_service.shared.domain.bus.event.BaseEvent;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.experimental.UtilityClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@UtilityClass
public class Utils {
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final ObjectMapper mapper = new ObjectMapper();

    static {
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
    }

    public static String dateToString(LocalDateTime dateTime) {
        return dateTime.format(dateFormatter);
    }

    public static LocalDateTime stringToDate(String dateString) {
        return LocalDateTime.parse(dateString, dateFormatter);
    }

    public static String toJson(Object object) {
        try {
            return mapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {

            throw new RuntimeException("Error serializing object to JSON ", e);
        }
    }

    public static Map<String, Object> toMap(Object object) {
        return mapper.convertValue(object, new TypeReference<>() {
        });
    }

    public static <T> T toMap(Object object, Class<T> clazz) {
        return mapper.convertValue(object, clazz);
    }

    public static <T> T toMap(Object object, TypeReference<T> typeReference) {
        return mapper.convertValue(object, typeReference);
    }

    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return mapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error deserializing JSON ", e);
        }
    }

    public static <T> T fromJson(String json, TypeReference<T> typeReference) {
        try {
            return mapper.readValue(json, typeReference);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error deserializing JSON with TypeReference ", e);
        }
    }

    public static String getEventName(Class<? extends BaseEvent> eventClass) {
        try {
            java.lang.reflect.Method method = eventClass.getDeclaredMethod("eventName");
            method.setAccessible(true);
            return (String) method.invoke(null);
        } catch (NoSuchMethodException e) {
            throw new IllegalArgumentException("The eventName method was not found in the domain event for " + eventClass.getName(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error invoking eventName on " + eventClass.getName(), e);
        }
    }

    public static <T> Page<T> paginateList(final Pageable pageable, List<T> list) {
        int first = Math.min(Long.valueOf(pageable.getOffset()).intValue(), list.size());
        int last = Math.min(first + pageable.getPageSize(), list.size());
        return new PageImpl<>(list.subList(first, last), pageable, list.size());
    }

    public static ObjectMapper getMapper() {
        return mapper;
    }
}
