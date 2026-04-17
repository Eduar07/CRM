package com.campusland.crm.domain.email;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.contact.EmailAddress;
import com.campusland.crm.domain.shared.AggregateRoot;
import com.campusland.crm.domain.shared.DomainException;

import java.time.Instant;

public class EmailRecord extends AggregateRoot<EmailRecordId> {

    private final CompanyId companyId;
    private final ContactId contactId;
    private final EmailAddress to;
    private final String subject;
    private final String content;
    private EmailStatus status;
    private final Instant sentAt;

    private EmailRecord(EmailRecordId id,
                        CompanyId companyId,
                        ContactId contactId,
                        EmailAddress to,
                        String subject,
                        String content,
                        EmailStatus status,
                        Instant sentAt) {
        super(id);
        this.companyId = companyId;
        this.contactId = contactId;
        this.to = to;
        this.subject = subject;
        this.content = content;
        this.status = status;
        this.sentAt = sentAt;
    }

    public static EmailRecord sent(CompanyId companyId,
                                   ContactId contactId,
                                   EmailAddress to,
                                   String subject,
                                   String content) {
        if (companyId == null || contactId == null) {
            throw new DomainException("companyId y contactId son obligatorios");
        }
        if (subject == null || subject.isBlank()) {
            throw new DomainException("subject es obligatorio");
        }
        if (content == null || content.isBlank()) {
            throw new DomainException("content es obligatorio");
        }
        return new EmailRecord(
                EmailRecordId.newId(),
                companyId,
                contactId,
                to,
                subject,
                content,
                EmailStatus.SENT,
                Instant.now()
        );
    }

    public static EmailRecord failed(CompanyId companyId,
                                     ContactId contactId,
                                     EmailAddress to,
                                     String subject,
                                     String content) {
        return new EmailRecord(
                EmailRecordId.newId(),
                companyId,
                contactId,
                to,
                subject,
                content,
                EmailStatus.FAILED,
                Instant.now()
        );
    }

    public static EmailRecord rehydrate(EmailRecordId id,
                                        CompanyId companyId,
                                        ContactId contactId,
                                        EmailAddress to,
                                        String subject,
                                        String content,
                                        EmailStatus status,
                                        Instant sentAt) {
        return new EmailRecord(id, companyId, contactId, to, subject, content, status, sentAt);
    }

    public CompanyId companyId() {
        return companyId;
    }

    public ContactId contactId() {
        return contactId;
    }

    public EmailAddress to() {
        return to;
    }

    public String subject() {
        return subject;
    }

    public String content() {
        return content;
    }

    public EmailStatus status() {
        return status;
    }

    public Instant sentAt() {
        return sentAt;
    }
}