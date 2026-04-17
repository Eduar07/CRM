package com.campusland.crm.infrastructure.integration.microsoft.dto;

public record TokenResponse(
        String access_token,
        String refresh_token,
        String token_type,
        Integer expires_in
) {
}