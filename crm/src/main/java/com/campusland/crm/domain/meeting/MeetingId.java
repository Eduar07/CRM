package com.campusland.crm.domain.meeting;

import java.util.UUID;

public record MeetingId(UUID value) {
    public MeetingId {
        if (value == null) {
            throw new IllegalArgumentException("MeetingId no puede ser null");
        }
    }

    public static MeetingId newId() {
        return new MeetingId(UUID.randomUUID());
    }
}