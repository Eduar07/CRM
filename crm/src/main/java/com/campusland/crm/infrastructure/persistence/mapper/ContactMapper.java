package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.Contact;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.contact.ContactName;
import com.campusland.crm.domain.contact.ContactRole;
import com.campusland.crm.domain.contact.EmailAddress;
import com.campusland.crm.infrastructure.persistence.entity.ContactEntity;

public final class ContactMapper {

    private ContactMapper() {
    }

    public static ContactEntity toEntity(Contact domain) {
        return new ContactEntity(
                domain.id().value(),
                domain.companyId().value(),
                domain.name().value(),
                domain.email().value(),
                domain.role().name()
        );
    }

    public static Contact toDomain(ContactEntity entity) {
        return Contact.rehydrate(
                new ContactId(entity.getId()),
                new CompanyId(entity.getCompanyId()),
                new ContactName(entity.getName()),
                new EmailAddress(entity.getEmail()),
                ContactRole.valueOf(entity.getRole())
        );
    }
}