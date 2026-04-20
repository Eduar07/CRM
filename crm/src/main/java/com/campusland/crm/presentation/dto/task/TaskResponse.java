package com.campusland.crm.presentation.dto.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID userId,
        UUID companyId,
        String description,
        LocalDate dueDate,
        String status,
        Instant createdAt
) {}
