package ai.snippetquiz.core_service.contentbank.application.contententry.findall;

import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.service.ContentEntryService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class FindAllContentEntriesQueryHandler implements QueryHandler<FindAllContentEntriesQuery, PagedModelResponse<ContentEntryDTOResponse>> {
    private final ContentEntryService contentEntryService;

    @Override
    public PagedModelResponse<ContentEntryDTOResponse> handle(FindAllContentEntriesQuery query) {
        return contentEntryService.findAll(new UserId(query.getUserId()), new ContentBankId(query.getBankId()), query.getName(), query.getPageable());
    }
}