package ai.snippetquiz.core_service.service;

import ai.snippetquiz.core_service.dto.request.CreateOrUpdateInstructionRequest;
import ai.snippetquiz.core_service.dto.response.InstructionResponse;
import ai.snippetquiz.core_service.entity.QuizGenerationInstruction;
import ai.snippetquiz.core_service.repository.QuizGenerationInstructionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InstructionsService {
    
    private final QuizGenerationInstructionRepository instructionRepository;
    
    @Transactional(readOnly = true)
    public InstructionResponse findByUserId(UUID userId) {
        Optional<QuizGenerationInstruction> instruction = instructionRepository.findFirstByUserId(userId);
        
        return new InstructionResponse(
            instruction.map(QuizGenerationInstruction::getInstruction).orElse(null),
            instruction.map(QuizGenerationInstruction::getUpdatedAt).orElse(null)
        );
    }
    
    public InstructionResponse createOrUpdate(UUID userId, CreateOrUpdateInstructionRequest request) {
        String trimmedInstruction = request.instruction().trim();
        
        // Check if user already has an instruction
        Optional<QuizGenerationInstruction> existingInstruction = instructionRepository.findFirstByUserId(userId);
        
        QuizGenerationInstruction result;
        
        if (existingInstruction.isPresent()) {
            // Update existing instruction
            QuizGenerationInstruction instruction = existingInstruction.get();
            instruction.setInstruction(trimmedInstruction);
            instruction.setUpdatedAt(LocalDateTime.now());
            result = instructionRepository.save(instruction);
        } else {
            // Create new instruction
            QuizGenerationInstruction newInstruction = new QuizGenerationInstruction();
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