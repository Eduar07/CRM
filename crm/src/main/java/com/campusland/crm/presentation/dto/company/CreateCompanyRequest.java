package com.campusland.crm.presentation.dto.company;

import jakarta.validation.constraints.NotBlank;

public record CreateCompanyRequest(
        @NotBlank String name,
        @NotBlank String linkedinUrl,
        @NotBlank String country,
        String department,
        String industry,
        String size,
        String website,
        String assignedTo
) {}
