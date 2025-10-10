package ai.snippetquiz.core_service.instruction.adapter.in;

import ai.snippetquiz.core_service.shared.util.Constants;
import ai.snippetquiz.core_service.instruction.application.dto.request.CreateOrUpdateInstructionRequest;
import ai.snippetquiz.core_service.instruction.application.dto.response.InstructionResponse;
import ai.snippetquiz.core_service.instruction.application.service.InstructionsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/instructions")
@RequiredArgsConstructor
public class InstructionsController {
    
    private final InstructionsService instructionsService;
    
    @GetMapping
    public InstructionResponse findByUserId(
            @RequestHeader(Constants.USER_ID_HEADER) String userId) {
        return instructionsService.findByUserId(UUID.fromString(userId));
    }
    
    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public InstructionResponse createOrUpdate(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateOrUpdateInstructionRequest request) {
        return instructionsService.createOrUpdate(UUID.fromString(userId), request);
    }
}