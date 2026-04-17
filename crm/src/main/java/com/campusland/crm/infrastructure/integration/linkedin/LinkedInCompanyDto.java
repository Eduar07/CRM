package com.campusland.crm.infrastructure.integration.linkedin;

public record LinkedInCompanyDto(
        String name,
        String linkedinUrl,
        String country,
        String department
) {
}