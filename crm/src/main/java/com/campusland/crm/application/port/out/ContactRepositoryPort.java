package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.contact.Contact;
import com.campusland.crm.domain.contact.ContactId;

import java.util.List;
import java.util.Optional;

public interface ContactRepositoryPort {
    Contact save(Contact contact);
    Optional<Contact> findById(ContactId id);
    List<Contact> findByCompanyId(String companyId);
}