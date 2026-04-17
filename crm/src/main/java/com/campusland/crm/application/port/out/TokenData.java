package com.campusland.crm.application.port.out;

import java.time.Instant;

public record TokenData(
        String token,
        Instant expiresAt
) {
}