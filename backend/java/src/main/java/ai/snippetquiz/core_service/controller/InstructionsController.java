package ai.snippetquiz.core_service.controller;

import ai.snippetquiz.core_service.dto.request.CreateOrUpdateInstructionRequest;
import ai.snippetquiz.core_service.dto.response.InstructionResponse;
import ai.snippetquiz.core_service.service.InstructionsService;
import ai.snippetquiz.core_service.util.Constants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/instructions")
@RequiredArgsConstructor
public class InstructionsController {
    
    private final InstructionsService instructionsService;
    
    @GetMapping
    public ResponseEntity<InstructionResponse> findByUserId(
            @RequestHeader(Constants.USER_ID_HEADER) String userId) {
        InstructionResponse response = instructionsService.findByUserId(UUID.fromString(userId));
        return ResponseEntity.ok(response);
    }
    
    @PutMapping
    public ResponseEntity<InstructionResponse> createOrUpdate(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateOrUpdateInstructionRequest request) {
        InstructionResponse response = instructionsService.createOrUpdate(UUID.fromString(userId), request);
        return ResponseEntity.ok(response);
    }
}