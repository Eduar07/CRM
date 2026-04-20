package com.campusland.crm.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leads")
public class LeadEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "company_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID companyId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "contact_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID contactId;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected LeadEntity() {
    }

    public LeadEntity(UUID id,
                      UUID companyId,
                      UUID contactId,
                      String source,
                      String status,
                      Instant createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.contactId = contactId;
        this.source = source;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public UUID getContactId() {
        return contactId;
    }

    public String getSource() {
        return source;
    }

    public String getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
