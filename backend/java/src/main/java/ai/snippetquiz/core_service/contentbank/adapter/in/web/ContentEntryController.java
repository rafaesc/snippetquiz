package ai.snippetquiz.core_service.contentbank.adapter.in.web;

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

import ai.snippetquiz.core_service.shared.util.Constants;
import ai.snippetquiz.core_service.contentbank.application.dto.request.CreateContentEntryRequest;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.dto.response.ContentEntryResponse;
import ai.snippetquiz.core_service.contentbank.application.service.ContentEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/content-entry")
@Validated
@RequiredArgsConstructor
public class ContentEntryController {

    private final ContentEntryService contentEntryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContentEntryResponse create(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateContentEntryRequest request) {

        return contentEntryService.create(UUID.fromString(userId), request);
    }

    @GetMapping("/{id}")
    public ContentEntryDTOResponse findById(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long id) {

        return contentEntryService.findById(UUID.fromString(userId), id);
    }

    @GetMapping("/bank/{bankId}")
    public PagedModel<ContentEntryDTOResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long bankId,
            @RequestParam(required = false) String name,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) @SortDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {

        return contentEntryService.findAll(UUID.fromString(userId),
                bankId, name, pageable);
    }

    @PostMapping("/{id}/clone-to/{targetBankId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ContentEntryResponse clone(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long id,
            @PathVariable Long targetBankId) {

        return contentEntryService.clone(UUID.fromString(userId), id, targetBankId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long id) {

        contentEntryService.remove(UUID.fromString(userId), id);
    }
}
