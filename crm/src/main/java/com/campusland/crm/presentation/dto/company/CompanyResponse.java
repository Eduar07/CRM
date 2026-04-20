package com.campusland.crm.presentation.dto.company;

import java.time.Instant;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String name,
        String industry,
        String size,
        String linkedinUrl,
        String website,
        String country,
        String department,
        String assignedTo,
        String contactStatus,
        Instant createdAt
) {}
