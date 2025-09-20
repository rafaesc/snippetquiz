package ai.snippetquiz.core_service.controller;

import ai.snippetquiz.core_service.dto.request.CreateContentBankRequest;
import ai.snippetquiz.core_service.dto.request.DuplicateContentBankRequest;
import ai.snippetquiz.core_service.dto.request.UpdateContentBankRequest;
import ai.snippetquiz.core_service.dto.response.ContentBankItemResponse;
import ai.snippetquiz.core_service.dto.response.ContentBankResponse;
import ai.snippetquiz.core_service.service.ContentBankService;
import ai.snippetquiz.core_service.util.Constants;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/content-bank")
@Validated
public class ContentBankController {

    private final ContentBankService contentBankService;

    @PostMapping
    public ResponseEntity<ContentBankResponse> create(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateContentBankRequest request) {

        ContentBankResponse response = contentBankService.create(UUID.fromString(userId), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public PagedModel<ContentBankItemResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @RequestParam(required = false) String name,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) @SortDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
        return contentBankService.findAll(UUID.fromString(userId), name, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentBankResponse> findOne(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        var response = contentBankService.findOne(UUID.fromString(userId), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentBankResponse> update(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @RequestBody UpdateContentBankRequest request) {
        var response = contentBankService.update(UUID.fromString(userId), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        contentBankService.remove(UUID.fromString(userId), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ContentBankResponse> duplicate(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @RequestBody DuplicateContentBankRequest request) {
        ContentBankResponse response = contentBankService.duplicate(UUID.fromString(userId), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}