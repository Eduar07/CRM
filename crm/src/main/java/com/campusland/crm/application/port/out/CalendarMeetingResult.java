package com.campusland.crm.application.port.out;

public record CalendarMeetingResult(
        boolean success,
        String externalMeetingId,
        String meetingLink,
        String errorMessage
) {
}
