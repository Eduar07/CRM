package com.campusland.crm.presentation.dto.contact;

import com.campusland.crm.domain.contact.ContactRole;

import java.util.UUID;

public record ContactResponse(
        UUID id,
        UUID companyId,
        String name,
        String email,
        ContactRole role
) {
}