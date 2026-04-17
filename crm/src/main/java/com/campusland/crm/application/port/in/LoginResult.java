package com.campusland.crm.application.port.in;

import com.campusland.crm.domain.user.UserRole;

import java.time.Instant;
import java.util.UUID;

public record LoginResult(
        UUID userId,
        String username,
        UserRole role,
        String accessToken,
        Instant expiresAt
) {
}
