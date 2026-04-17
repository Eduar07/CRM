package com.campusland.crm.presentation.dto.lead;

import com.campusland.crm.domain.lead.LeadSource;
import com.campusland.crm.domain.lead.LeadStatus;

import java.time.Instant;
import java.util.UUID;

public record LeadResponse(
        UUID id,
        UUID companyId,
        UUID contactId,
        LeadSource source,
        LeadStatus status,
        Instant createdAt
) {
}
