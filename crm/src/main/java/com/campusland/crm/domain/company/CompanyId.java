package com.campusland.crm.domain.company;

import java.util.UUID;

public record CompanyId(UUID value) {
    public CompanyId {
        if (value == null) {
            throw new IllegalArgumentException("CompanyId no puede ser null");
        }
    }

    public static CompanyId newId() {
        return new CompanyId(UUID.randomUUID());
    }
}