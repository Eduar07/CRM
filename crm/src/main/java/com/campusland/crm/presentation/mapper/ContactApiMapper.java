package com.campusland.crm.presentation.mapper;

import com.campusland.crm.domain.contact.Contact;
import com.campusland.crm.presentation.dto.contact.ContactResponse;

public final class ContactApiMapper {

    private ContactApiMapper() {
    }

    public static ContactResponse toResponse(Contact contact) {
        return new ContactResponse(
                contact.id().value(),
                contact.companyId().value(),
                contact.name().value(),
                contact.email().value(),
                contact.role()
        );
    }
}