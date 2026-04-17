package com.campusland.crm.domain.lead;

import java.util.UUID;

public record LeadId(UUID value) {
    public LeadId {
        if (value == null) {
            throw new IllegalArgumentException("LeadId no puede ser null");
        }
    }

    public static LeadId newId() {
        return new LeadId(UUID.randomUUID());
    }
}