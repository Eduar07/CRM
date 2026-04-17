package com.campusland.crm.domain.company;

import com.campusland.crm.domain.shared.DomainEvent;

import java.time.Instant;

public record CompanyCreatedEvent(
        CompanyId companyId,
        String name,
        String linkedinUrl,
        Instant occurredOn
) implements DomainEvent {
}