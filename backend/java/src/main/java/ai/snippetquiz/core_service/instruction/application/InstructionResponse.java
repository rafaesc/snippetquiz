package ai.snippetquiz.core_service.instruction.application;

import com.fasterxml.jackson.annotation.JsonFormat;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class InstructionResponse implements Response {
    private String instruction;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}