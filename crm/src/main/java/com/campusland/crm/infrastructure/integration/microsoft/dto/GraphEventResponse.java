package com.campusland.crm.infrastructure.integration.microsoft.dto;

public record GraphEventResponse(
        boolean success,
        String eventId,
        String meetingLink,
        String errorMessage
) {
}