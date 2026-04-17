package com.campusland.crm.infrastructure.integration.email;

public record EmailProviderRequest(
        String to,
        String subject,
        String content
) {
}
