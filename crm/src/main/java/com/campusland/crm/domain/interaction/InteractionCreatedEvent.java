package com.campusland.crm.domain.interaction;

import com.campusland.crm.domain.shared.DomainEvent;

import java.time.Instant;

public record InteractionCreatedEvent(
        InteractionId interactionId,
        Instant occurredOn
) implements DomainEvent {
}