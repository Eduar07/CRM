package com.campusland.crm.infrastructure.integration.email;

public record EmailProviderResponse(
        boolean success,
        String providerMessageId,
        String errorMessage
) {
}