package ai.snippetquiz.core_service.instruction.adapter.in;

import ai.snippetquiz.core_service.shared.domain.DomainError;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandBus;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandlerExecutionError;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryBus;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandlerExecutionError;
import ai.snippetquiz.core_service.shared.spring.ApiController;
import ai.snippetquiz.core_service.shared.util.Constants;
import ai.snippetquiz.core_service.instruction.adapter.in.request.CreateOrUpdateInstructionRequest;
import ai.snippetquiz.core_service.instruction.application.InstructionResponse;
import ai.snippetquiz.core_service.instruction.application.find.FindInstructionQuery;
import ai.snippetquiz.core_service.instruction.application.service.InstructionsService;
import ai.snippetquiz.core_service.instruction.application.update.UpdateInstructionCommand;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/instructions")
public class InstructionsController extends ApiController {
    public InstructionsController(
            QueryBus queryBus,
            CommandBus commandBus,
            InstructionsService instructionsService) {
        super(queryBus, commandBus);
    }

    @GetMapping
    public InstructionResponse findByUserId(
            @RequestHeader(Constants.USER_ID_HEADER) String userId) throws QueryHandlerExecutionError {
        return ask(new FindInstructionQuery(UUID.fromString(userId)));
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public void createOrUpdate(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateOrUpdateInstructionRequest request) throws CommandHandlerExecutionError {
        dispatch(new UpdateInstructionCommand(
                UUID.fromString(userId),
                request.instruction()));
    }

    @Override
    public HashMap<Class<? extends DomainError>, HttpStatus> errorMapping() {
        return null;
    }
}