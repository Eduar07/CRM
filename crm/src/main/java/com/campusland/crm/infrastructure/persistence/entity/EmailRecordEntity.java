package com.campusland.crm.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_records")
public class EmailRecordEntity {

    @Id
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "contact_id", nullable = false)
    private UUID contactId;

    @Column(name = "to_email", nullable = false)
    private String toEmail;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String status;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    protected EmailRecordEntity() {
    }

    public EmailRecordEntity(UUID id,
                             UUID companyId,
                             UUID contactId,
                             String toEmail,
                             String subject,
                             String content,
                             String status,
                             Instant sentAt) {
        this.id = id;
        this.companyId = companyId;
        this.contactId = contactId;
        this.toEmail = toEmail;
        this.subject = subject;
        this.content = content;
        this.status = status;
        this.sentAt = sentAt;
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

    public String getToEmail() {
        return toEmail;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    public String getStatus() {
        return status;
    }

    public Instant getSentAt() {
        return sentAt;
    }
}