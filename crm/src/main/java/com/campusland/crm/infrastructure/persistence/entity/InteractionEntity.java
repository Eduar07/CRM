package com.campusland.crm.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interactions")
public class InteractionEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "company_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID companyId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID userId;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected InteractionEntity() {}

    public InteractionEntity(UUID id, UUID companyId, UUID userId, String type, String notes, Instant createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.userId = userId;
        this.type = type;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getCompanyId() { return companyId; }
    public UUID getUserId() { return userId; }
    public String getType() { return type; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
