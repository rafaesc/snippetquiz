package ai.snippetquiz.core_service.shared.domain.bus.query;

import org.springframework.data.domain.Page;
import org.springframework.data.web.PagedModel;

public class PagedModelResponse<T> extends PagedModel<T> implements Response {
    public PagedModelResponse(Page<T> page) {
        super(page);
    }
}
