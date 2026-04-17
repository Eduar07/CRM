package com.campusland.crm.domain.meeting;

import com.campusland.crm.domain.shared.DomainEvent;

import java.time.Instant;

public record MeetingScheduledEvent(
        MeetingId meetingId,
        Instant occurredOn
) implements DomainEvent {
}