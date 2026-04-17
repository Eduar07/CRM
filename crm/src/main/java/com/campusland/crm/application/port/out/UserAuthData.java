package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.user.UserRole;

import java.util.UUID;

public record UserAuthData(
        UUID id,
        String username,
        String passwordHash,
        UserRole role,
        boolean active
) {
}