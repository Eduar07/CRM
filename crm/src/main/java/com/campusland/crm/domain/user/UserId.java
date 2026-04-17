package com.campusland.crm.domain.user;

import java.util.UUID;

public record UserId(UUID value) {
    public UserId {
        if (value == null) {
            throw new IllegalArgumentException("UserId no puede ser null");
        }
    }

    public static UserId newId() {
        return new UserId(UUID.randomUUID());
    }
}