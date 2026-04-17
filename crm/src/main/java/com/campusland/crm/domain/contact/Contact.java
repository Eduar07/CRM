package com.campusland.crm.domain.contact;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.shared.AggregateRoot;
import com.campusland.crm.domain.shared.DomainException;

public class Contact extends AggregateRoot<ContactId> {

    private final CompanyId companyId;
    private ContactName name;
    private EmailAddress email;
    private ContactRole role;

    private Contact(ContactId id, CompanyId companyId, ContactName name, EmailAddress email, ContactRole role) {
        super(id);
        this.companyId = companyId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public static Contact create(CompanyId companyId, ContactName name, EmailAddress email, ContactRole role) {
        if (companyId == null) {
            throw new DomainException("companyId es obligatorio");
        }
        return new Contact(ContactId.newId(), companyId, name, email, role);
    }

    public static Contact rehydrate(ContactId id, CompanyId companyId, ContactName name, EmailAddress email, ContactRole role) {
        return new Contact(id, companyId, name, email, role);
    }

    public CompanyId companyId() {
        return companyId;
    }

    public ContactName name() {
        return name;
    }

    public EmailAddress email() {
        return email;
    }

    public ContactRole role() {
        return role;
    }
}