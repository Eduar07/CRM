package com.campusland.crm.domain.email;

import com.campusland.crm.domain.shared.DomainEvent;

import java.time.Instant;

public record EmailSentEvent(
        EmailRecordId emailRecordId,
        String subject,
        String to,
        Instant occurredOn
) implements DomainEvent {
}