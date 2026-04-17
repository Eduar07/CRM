package com.campusland.crm.presentation.dto.meeting;

import com.campusland.crm.domain.meeting.MeetingStatus;

import java.time.Instant;
import java.util.UUID;

public record MeetingResponse(
        UUID id,
        UUID companyId,
        UUID contactId,
        UUID userId,
        String title,
        String description,
        Instant startTime,
        Instant endTime,
        String meetingLink,
        MeetingStatus status
) {
}