package com.campusland.crm.presentation.dto.email;

import jakarta.validation.constraints.NotBlank;

public record SendEmailRequest(
        @NotBlank String companyId,
        @NotBlank String contactId
) {
}