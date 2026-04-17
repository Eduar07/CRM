package com.campusland.crm.presentation.dto.contact;

import com.campusland.crm.domain.contact.ContactRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateContactRequest(
        @NotBlank String companyId,
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotNull ContactRole role
) {
}