package com.campusland.crm.presentation.dto.auth;

import com.campusland.crm.domain.user.UserRole;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        UserRole role
) {
}