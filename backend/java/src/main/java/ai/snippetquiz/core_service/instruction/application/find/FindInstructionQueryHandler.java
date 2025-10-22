package ai.snippetquiz.core_service.instruction.application.find;

import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.instruction.application.InstructionResponse;
import ai.snippetquiz.core_service.instruction.application.service.InstructionsService;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FindInstructionQueryHandler implements QueryHandler<FindInstructionQuery, InstructionResponse> {
    private final InstructionsService instructionsService;

    @Override
    public InstructionResponse handle(FindInstructionQuery query) {
        return instructionsService.findByUserId(query.getUserId());
    }
    
}
