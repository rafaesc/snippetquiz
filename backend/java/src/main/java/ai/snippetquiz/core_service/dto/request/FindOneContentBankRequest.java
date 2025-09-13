package ai.snippetquiz.core_service.dto.request;

public record FindOneContentBankRequest(
    String id,
    String userId
) {}