package com.campusland.crm.application.port.in;

public record ScheduleMeetingCommand(
        String companyId,
        String contactId,
        String userId,
        String title,
        String description,
        String startTime,
        String endTime,
        String meetingLink
) {
}
