package ai.snippetquiz.core_service.contentbank.application.contentbank.find;

import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.contentbank.application.ContentBankResponse;
import ai.snippetquiz.core_service.contentbank.application.service.ContentBankService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FindContentBankQueryHandler implements QueryHandler<FindContentBankQuery, ContentBankResponse> {
    private final ContentBankService contentBankService;

    @Override
    public ContentBankResponse handle(FindContentBankQuery query) {
        return contentBankService.findOne(
                new UserId(query.getUserId()),
                new ContentBankId(query.getId()));
    }
}
