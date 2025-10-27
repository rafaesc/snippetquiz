package ai.snippetquiz.core_service.instruction.application.service;

import ai.snippetquiz.core_service.instruction.application.InstructionResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

public interface InstructionsService {
    InstructionResponse findByUserId(UserId userId);
    
    void createOrUpdate(UserId userId, String instruction);
}