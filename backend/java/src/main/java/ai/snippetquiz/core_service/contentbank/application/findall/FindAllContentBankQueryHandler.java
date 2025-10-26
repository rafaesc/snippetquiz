package ai.snippetquiz.core_service.contentbank.application.findall;

import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.contentbank.application.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.service.ContentBankService;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FindAllContentBankQueryHandler implements QueryHandler<FindAllContentBankQuery, PagedModelResponse<ContentBankItemResponse>>  {
    private final ContentBankService contentBankService;

    @Override
    public PagedModelResponse<ContentBankItemResponse> handle(FindAllContentBankQuery query) {
        return contentBankService.findAll(new UserId(query.getUserId()), query.getName(), query.getPageable());
    }
}
