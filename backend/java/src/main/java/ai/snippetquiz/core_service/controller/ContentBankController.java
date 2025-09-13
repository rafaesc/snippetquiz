package ai.snippetquiz.core_service.controller;

import ai.snippetquiz.core_service.dto.request.*;
import ai.snippetquiz.core_service.dto.response.*;
import ai.snippetquiz.core_service.service.ContentBankService;
import ai.snippetquiz.core_service.util.Constants;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RestController
@RequestMapping("/content-banks")
@Validated
@RequiredArgsConstructor
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
    public ResponseEntity<PaginatedContentBanksResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid FindAllContentBanksRequest request) {

        PaginatedContentBanksResponse response = contentBankService.findAll(UUID.fromString(userId), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentBankResponse> findOne(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {

        ContentBankResponse response = contentBankService.findOne(UUID.fromString(userId), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentBankResponse> update(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @RequestBody UpdateContentBankRequest request) {
        ContentBankResponse response = contentBankService.update(UUID.fromString(userId), id, request);
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