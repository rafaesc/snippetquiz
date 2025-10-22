package ai.snippetquiz.core_service.instruction.application.service;

import java.util.UUID;

import ai.snippetquiz.core_service.instruction.application.InstructionResponse;

public interface InstructionsService {
    InstructionResponse findByUserId(UUID userId);
    
    void createOrUpdate(UUID userId, String instruction);
}