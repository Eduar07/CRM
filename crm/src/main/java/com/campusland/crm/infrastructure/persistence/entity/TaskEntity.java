package com.campusland.crm.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class TaskEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID userId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "company_id", columnDefinition = "CHAR(36)")
    private UUID companyId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected TaskEntity() {}

    public TaskEntity(UUID id, UUID userId, UUID companyId, String description,
                      LocalDate dueDate, String status, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.companyId = companyId;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status != null ? status : "PENDING";
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getCompanyId() { return companyId; }
    public String getDescription() { return description; }
    public LocalDate getDueDate() { return dueDate; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setStatus(String status) { this.status = status; }
}
