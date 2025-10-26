package ai.snippetquiz.core_service.contentbank.adapter.in.web;

import java.util.HashMap;
import java.util.UUID;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ai.snippetquiz.core_service.shared.domain.DomainError;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandBus;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandlerExecutionError;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryBus;
import ai.snippetquiz.core_service.shared.spring.ApiController;
import ai.snippetquiz.core_service.shared.util.Constants;
import ai.snippetquiz.core_service.contentbank.adapter.in.web.request.CreateContentEntryRequest;
import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.contententry.clone.CloneContentEntryCommand;
import ai.snippetquiz.core_service.contentbank.application.contententry.create.CreateContentEntryCommand;
import ai.snippetquiz.core_service.contentbank.application.contententry.delete.DeleteContentEntryCommand;
import ai.snippetquiz.core_service.contentbank.application.contententry.find.FindContentEntryQuery;
import ai.snippetquiz.core_service.contentbank.application.contententry.findall.FindAllContentEntriesQuery;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/content-entry")
@Validated
public class ContentEntryController extends ApiController {

    public ContentEntryController(
            QueryBus queryBus,
            CommandBus commandBus) {
        super(queryBus, commandBus);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateContentEntryRequest request) throws CommandHandlerExecutionError {

        dispatch(new CreateContentEntryCommand(
                UUID.fromString(userId),
                request.sourceUrl(),
                request.content(),
                request.type(),
                request.pageTitle(),
                request.bankId(),
                request.youtubeVideoId(),
                request.youtubeVideoDuration(),
                request.youtubeChannelId(),
                request.youtubeChannelName(),
                request.youtubeAvatarUrl()));
    }

    @GetMapping("/{id}")
    public ContentEntryDTOResponse findById(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long id) {

        return ask(new FindContentEntryQuery(UUID.fromString(userId), id));
    }

    @GetMapping("/bank/{bankId}")
    public PagedModel<ContentEntryDTOResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String bankId,
            @RequestParam(required = false) String name,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) @SortDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {

        return ask(new FindAllContentEntriesQuery(
                UUID.fromString(userId),
                UUID.fromString(bankId),
                name,
                pageable));
    }

    @PostMapping("/{id}/clone-to/{targetBankId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void clone(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long id,
            @PathVariable String targetBankId) throws CommandHandlerExecutionError {

        dispatch(new CloneContentEntryCommand(
                UUID.fromString(userId),
                id,
                UUID.fromString(targetBankId)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long id) throws CommandHandlerExecutionError {

        dispatch(new DeleteContentEntryCommand(
                UUID.fromString(userId),
                id));
    }

    @Override
    public HashMap<Class<? extends DomainError>, HttpStatus> errorMapping() {
        return null;
    }
}
