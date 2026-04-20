package com.campusland.crm.presentation.dto.company;

public record UpdateCompanyRequest(
        String name,
        String industry,
        String size,
        String website,
        String country,
        String department,
        String assignedTo,
        String contactStatus
) {}
