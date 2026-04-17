package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.contact.ContactRole;

public record ExternalContactData(
        String name,
        String email,
        ContactRole role,
        String source
) {
}