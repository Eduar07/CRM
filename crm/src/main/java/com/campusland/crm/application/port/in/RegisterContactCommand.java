package com.campusland.crm.application.port.in;

import com.campusland.crm.domain.contact.ContactRole;

public record RegisterContactCommand(
        String companyId,
        String name,
        String email,
        ContactRole role
) {
}