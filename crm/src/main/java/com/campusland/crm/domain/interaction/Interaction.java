package com.campusland.crm.domain.interaction;

import java.time.Instant;
import java.util.UUID;

public class Interaction {
    private final UUID id;
    private final UUID companyId;
    private final UUID userId;
    private final String type;
    private final String notes;
    private final Instant createdAt;

    private Interaction(UUID id, UUID companyId, UUID userId, String type, String notes, Instant createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.userId = userId;
        this.type = type;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public static Interaction create(UUID companyId, UUID userId, String type, String notes) {
        return new Interaction(UUID.randomUUID(), companyId, userId, type, notes, Instant.now());
    }

    public static Interaction rehydrate(UUID id, UUID companyId, UUID userId, String type, String notes, Instant createdAt) {
        return new Interaction(id, companyId, userId, type, notes, createdAt);
    }

    public UUID id() { return id; }
    public UUID companyId() { return companyId; }
    public UUID userId() { return userId; }
    public String type() { return type; }
    public String notes() { return notes; }
    public Instant createdAt() { return createdAt; }
}
