package ai.snippetquiz.core_service.contentbank.adapter.in.web;

import ai.snippetquiz.core_service.contentbank.adapter.in.web.request.CreateContentBankRequest;
import ai.snippetquiz.core_service.contentbank.adapter.in.web.request.DuplicateContentBankRequest;
import ai.snippetquiz.core_service.contentbank.adapter.in.web.request.UpdateContentBankRequest;
import ai.snippetquiz.core_service.contentbank.application.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.ContentBankResponse;
import ai.snippetquiz.core_service.contentbank.application.contentbank.create.CreateContentBankCommand;
import ai.snippetquiz.core_service.contentbank.application.contentbank.delete.DeleteContentBankCommand;
import ai.snippetquiz.core_service.contentbank.application.contentbank.duplicate.DuplicateContentBankCommand;
import ai.snippetquiz.core_service.contentbank.application.contentbank.find.FindContentBankQuery;
import ai.snippetquiz.core_service.contentbank.application.contentbank.findall.FindAllContentBankQuery;
import ai.snippetquiz.core_service.shared.domain.DomainError;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandBus;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandlerExecutionError;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryBus;
import ai.snippetquiz.core_service.shared.spring.ApiController;
import ai.snippetquiz.core_service.shared.util.Constants;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/content-bank")
@Validated
public class ContentBankController extends ApiController {

    public ContentBankController(
            QueryBus queryBus,
            CommandBus commandBus) {
        super(queryBus, commandBus);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateContentBankRequest request) throws CommandHandlerExecutionError {
        var id = UUID.randomUUID();
        dispatch(new CreateContentBankCommand(
                id,
                request.name(),
                UUID.fromString(userId)));
    }

    @GetMapping
    public PagedModel<ContentBankItemResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @RequestParam(required = false) String name,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) @SortDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
        return ask(new FindAllContentBankQuery(UUID.fromString(userId), name, pageable));
    }

    @GetMapping("/{id}")
    public ContentBankResponse findOne(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        return ask(new FindContentBankQuery(UUID.fromString(userId), UUID.fromString(id)));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void update(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @RequestBody UpdateContentBankRequest request) {
        dispatch(new CreateContentBankCommand(
                UUID.fromString(id),
                request.name(),
                UUID.fromString(userId)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        dispatch(new DeleteContentBankCommand(
                UUID.fromString(id),
                UUID.fromString(userId)));
    }

    @PostMapping("/{id}/duplicate")
    @ResponseStatus(HttpStatus.CREATED)
    public void duplicate(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @RequestBody DuplicateContentBankRequest request) {
        dispatch(new DuplicateContentBankCommand(
                request.name(),
                UUID.fromString(id),
                UUID.fromString(userId)));
    }

    @Override
    public HashMap<Class<? extends DomainError>, HttpStatus> errorMapping() {
        return null;
    }
}
