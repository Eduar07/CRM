package com.campusland.crm.presentation.dto.meeting;

import jakarta.validation.constraints.NotBlank;

public record ScheduleMeetingRequest(
        @NotBlank String companyId,
        @NotBlank String contactId,
        @NotBlank String userId,
        @NotBlank String title,
        String description,
        @NotBlank String startTime,
        @NotBlank String endTime,
        String meetingLink
) {
}