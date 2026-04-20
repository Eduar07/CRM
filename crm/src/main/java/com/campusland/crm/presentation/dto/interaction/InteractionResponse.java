package com.campusland.crm.presentation.dto.interaction;

import java.time.Instant;
import java.util.UUID;

public record InteractionResponse(
        UUID id,
        UUID companyId,
        UUID userId,
        String type,
        String notes,
        Instant createdAt
) {}
