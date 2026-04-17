package com.campusland.crm.infrastructure.integration.microsoft.dto;

import java.util.List;

public record GraphEventRequest(
        String subject,
        String body,
        String startDateTime,
        String endDateTime,
        List<String> attendees,
        boolean createTeamsLink
) {
}