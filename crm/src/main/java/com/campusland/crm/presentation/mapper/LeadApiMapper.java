package com.campusland.crm.presentation.mapper;

import com.campusland.crm.domain.lead.Lead;
import com.campusland.crm.presentation.dto.lead.LeadResponse;

public final class LeadApiMapper {

    private LeadApiMapper() {
    }

    public static LeadResponse toResponse(Lead lead) {
        return new LeadResponse(
                lead.id().value(),
                lead.companyId().value(),
                lead.contactId().value(),
                lead.source(),
                lead.status(),
                lead.createdAt()
        );
    }
}