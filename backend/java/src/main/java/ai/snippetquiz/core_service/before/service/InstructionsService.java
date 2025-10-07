package ai.snippetquiz.core_service.before.service;

import ai.snippetquiz.core_service.before.dto.request.CreateOrUpdateInstructionRequest;
import ai.snippetquiz.core_service.before.dto.response.InstructionResponse;
import ai.snippetquiz.core_service.before.entity.QuizGenerationInstruction;
import ai.snippetquiz.core_service.before.repository.QuizGenerationInstructionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InstructionsService {
    
    private final QuizGenerationInstructionRepository instructionRepository;
    
    @Transactional(readOnly = true)
    public InstructionResponse findByUserId(UUID userId) {
        var instruction = instructionRepository.findFirstByUserId(userId);
        
        return new InstructionResponse(
            instruction.map(QuizGenerationInstruction::getInstruction).orElse(null),
            instruction.map(QuizGenerationInstruction::getUpdatedAt).orElse(null)
        );
    }
    
    public InstructionResponse createOrUpdate(UUID userId, CreateOrUpdateInstructionRequest request) {
        var trimmedInstruction = request.instruction().trim();
        
        var existingInstruction = instructionRepository.findFirstByUserId(userId);
        
        QuizGenerationInstruction result;
        
        if (existingInstruction.isPresent()) {
            // Update existing instruction
            var instruction = existingInstruction.get();
            instruction.setInstruction(trimmedInstruction);
            instruction.setUpdatedAt(LocalDateTime.now());
            result = instructionRepository.save(instruction);
        } else {
            // Create new instruction
            var newInstruction = new QuizGenerationInstruction();
            newInstruction.setInstruction(trimmedInstruction);
            newInstruction.setUserId(userId);
            newInstruction.setUpdatedAt(LocalDateTime.now());
            result = instructionRepository.save(newInstruction);
        }
        
        return new InstructionResponse(
            result.getInstruction(),
            result.getUpdatedAt()
        );
    }
}