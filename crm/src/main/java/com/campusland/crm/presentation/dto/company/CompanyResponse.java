package com.campusland.crm.presentation.dto.company;

import java.time.Instant;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String name,
        String linkedinUrl,
        String country,
        String department,
        Instant createdAt
) {
}