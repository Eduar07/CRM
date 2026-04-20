package com.campusland.crm.application.port.in;

public record CreateCompanyCommand(
        String name,
        String linkedinUrl,
        String country,
        String department,
        String industry,
        String size,
        String website,
        String assignedTo
) {}
