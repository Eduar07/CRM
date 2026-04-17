package com.campusland.crm.application.port.out;

public record ExternalCompanyData(
        String name,
        String linkedinUrl,
        String country,
        String department
) {
}