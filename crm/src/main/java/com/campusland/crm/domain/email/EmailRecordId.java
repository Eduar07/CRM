package com.campusland.crm.domain.email;

import java.util.UUID;

public record EmailRecordId(UUID value) {
    public EmailRecordId {
        if (value == null) {
            throw new IllegalArgumentException("EmailRecordId no puede ser null");
        }
    }

    public static EmailRecordId newId() {
        return new EmailRecordId(UUID.randomUUID());
    }
}