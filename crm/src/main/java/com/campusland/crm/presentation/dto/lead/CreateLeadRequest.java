package com.campusland.crm.presentation.dto.lead;

import jakarta.validation.constraints.NotBlank;

public record CreateLeadRequest(
        @NotBlank String companyId,
        @NotBlank String contactId,
        @NotBlank String source
) {
}