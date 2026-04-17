package com.campusland.crm.domain.shared;

import java.time.Instant;

public interface DomainEvent {
    Instant occurredOn();
}