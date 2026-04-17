package com.campusland.crm.domain.contact;

import java.util.UUID;

public record ContactId(UUID value) {
    public ContactId {
        if (value == null) {
            throw new IllegalArgumentException("ContactId no puede ser null");
        }
    }

    public static ContactId newId() {
        return new ContactId(UUID.randomUUID());
    }
}