package com.campusland.crm.domain.interaction;

import com.campusland.crm.domain.shared.DomainException;

import java.util.UUID;

public record InteractionId(UUID value) {

    public InteractionId {
        if (value == null) {
            throw new DomainException("El id de interacción es obligatorio");
        }
    }

    public static InteractionId newId() {
        return new InteractionId(UUID.randomUUID());
    }
}
