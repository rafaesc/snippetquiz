package ai.snippetquiz.core_service.dto.request;

public record RemoveContentBankRequest(
    String id,
    String userId
) {}