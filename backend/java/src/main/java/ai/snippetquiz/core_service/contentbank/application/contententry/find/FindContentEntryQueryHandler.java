package ai.snippetquiz.core_service.contentbank.application.contententry.find;

import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.application.service.ContentEntryService;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class FindContentEntryQueryHandler implements QueryHandler<FindContentEntryQuery, ContentEntryDTOResponse> {
    private final ContentEntryService contentEntryService;

    @Override
    public ContentEntryDTOResponse handle(FindContentEntryQuery query) {
        return contentEntryService.findById(new UserId(query.getUserId()), query.getId());
    }
}