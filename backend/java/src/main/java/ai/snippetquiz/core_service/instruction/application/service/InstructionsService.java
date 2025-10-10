package ai.snippetquiz.core_service.instruction.application.service;

import ai.snippetquiz.core_service.instruction.application.dto.request.CreateOrUpdateInstructionRequest;
import ai.snippetquiz.core_service.instruction.application.dto.response.InstructionResponse;

import java.util.UUID;

public interface InstructionsService {
    InstructionResponse findByUserId(UUID userId);
    
    InstructionResponse createOrUpdate(UUID userId, CreateOrUpdateInstructionRequest request);
}