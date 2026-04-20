package com.campusland.crm.domain.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class Task {
    private final UUID id;
    private final UUID userId;
    private final UUID companyId;
    private final String description;
    private final LocalDate dueDate;
    private String status;
    private final Instant createdAt;

    private Task(UUID id, UUID userId, UUID companyId, String description,
                 LocalDate dueDate, String status, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.companyId = companyId;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status != null ? status : "PENDING";
        this.createdAt = createdAt;
    }

    public static Task create(UUID userId, UUID companyId, String description, LocalDate dueDate) {
        return new Task(UUID.randomUUID(), userId, companyId, description, dueDate, "PENDING", Instant.now());
    }

    public static Task rehydrate(UUID id, UUID userId, UUID companyId, String description,
                                  LocalDate dueDate, String status, Instant createdAt) {
        return new Task(id, userId, companyId, description, dueDate, status, createdAt);
    }

    public void complete() { this.status = "COMPLETED"; }

    public UUID id() { return id; }
    public UUID userId() { return userId; }
    public UUID companyId() { return companyId; }
    public String description() { return description; }
    public LocalDate dueDate() { return dueDate; }
    public String status() { return status; }
    public Instant createdAt() { return createdAt; }
}
