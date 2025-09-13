package ai.snippetquiz.core_service.controller;

import ai.snippetquiz.core_service.dto.request.*;
import ai.snippetquiz.core_service.dto.response.*;
import ai.snippetquiz.core_service.service.ContentEntryService;
import ai.snippetquiz.core_service.util.Constants;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RestController
@RequestMapping("/content-entries")
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

    @GetMapping
    public ResponseEntity<PaginatedResponse<ContentEntryItemResponse>> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid FindAllContentEntriesRequest request) {

        PaginatedResponse<ContentEntryItemResponse> response = contentEntryService.findAll(UUID.fromString(userId), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentEntryResponse> findOne(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {

        ContentEntryResponse response = contentEntryService.findOne(UUID.fromString(userId), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<ContentEntryResponse> clone(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @RequestBody CloneContentEntryRequest request) {

        ContentEntryResponse response = contentEntryService.clone(UUID.fromString(userId), id, request);
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

    @PutMapping("/{id}/questions-generated")
    public ResponseEntity<ContentEntryResponse> updateQuestionsGenerated(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {

        ContentEntryResponse response = contentEntryService.updateContentEntry(UUID.fromString(userId), id);
        return ResponseEntity.ok(response);
    }
}