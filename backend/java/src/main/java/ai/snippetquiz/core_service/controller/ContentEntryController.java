package ai.snippetquiz.core_service.controller;

import ai.snippetquiz.core_service.dto.request.CreateContentEntryRequest;
import ai.snippetquiz.core_service.dto.request.RemoveContentEntryRequest;
import ai.snippetquiz.core_service.dto.response.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.dto.response.ContentEntryResponse;
import ai.snippetquiz.core_service.service.ContentEntryService;
import ai.snippetquiz.core_service.util.Constants;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RestController
@RequestMapping("/content-entry")
@Validated
@RequiredArgsConstructor
public class ContentEntryController {

    private final ContentEntryService contentEntryService;

    @PostMapping
    public ResponseEntity<ContentEntryResponse> create(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateContentEntryRequest request) {

        ContentEntryResponse response = contentEntryService.create(UUID.fromString(userId), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/bank/{bankId}")
    public PagedModel<ContentEntryDTOResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String bankId,
            @RequestParam(required = false) String name,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) @SortDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {

        return contentEntryService.findAll(UUID.fromString(userId),
                bankId, name, pageable);
    }

    @PostMapping("/{id}/clone-to/{targetBankId}")
    public ResponseEntity<ContentEntryResponse> clone(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @PathVariable @NotBlank(message = "Target bank ID is required") String targetBankId) {

        var response = contentEntryService.clone(UUID.fromString(userId), id, targetBankId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {

        RemoveContentEntryRequest request = new RemoveContentEntryRequest(id);
        contentEntryService.remove(UUID.fromString(userId), request);
        return ResponseEntity.noContent().build();
    }
}