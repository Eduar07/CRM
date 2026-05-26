package com.campusland.crm.presentation.dto.company;

import jakarta.validation.constraints.NotBlank;

public record CreateCompanyRequest(
        @NotBlank String name,
        String linkedinUrl,
        @NotBlank String country,
        String department,
        String industry,
        String size,
        String website,
        String assignedTo,
        String nit,
        String phones,
        String emails,
        String address,
        String legalRep,
        String companyState,
        String description
) {}
