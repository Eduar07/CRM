package com.campusland.crm.presentation.dto.auth;

import com.campusland.crm.domain.user.UserRole;

import java.time.Instant;
import java.util.UUID;

public record LoginResponse(
        UUID userId,
        String username,
        UserRole role,
        String accessToken,
        Instant expiresAt
) {
}