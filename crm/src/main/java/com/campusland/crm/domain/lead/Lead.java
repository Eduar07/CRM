package com.campusland.crm.domain.lead;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.shared.AggregateRoot;
import com.campusland.crm.domain.shared.DomainException;

import java.time.Instant;

public class Lead extends AggregateRoot<LeadId> {

    private final CompanyId companyId;
    private final ContactId contactId;
    private LeadStatus status;
    private final LeadSource source;
    private final Instant createdAt;

    private Lead(LeadId id, CompanyId companyId, ContactId contactId, LeadSource source, LeadStatus status, Instant createdAt) {
        super(id);
        this.companyId = companyId;
        this.contactId = contactId;
        this.source = source;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Lead create(CompanyId companyId, ContactId contactId, LeadSource source) {
        if (companyId == null || contactId == null) {
            throw new DomainException("companyId y contactId son obligatorios");
        }
        return new Lead(LeadId.newId(), companyId, contactId, source, LeadStatus.NEW, Instant.now());
    }

    public static Lead rehydrate(LeadId id,
                                 CompanyId companyId,
                                 ContactId contactId,
                                 LeadSource source,
                                 LeadStatus status,
                                 Instant createdAt) {
        return new Lead(id, companyId, contactId, source, status, createdAt);
    }

    public void markAsContacted() {
        if (status == LeadStatus.CLOSED) {
            throw new DomainException("Un lead cerrado no puede volver a CONTACTED");
        }
        this.status = LeadStatus.CONTACTED;
    }

    public void markAsReplied() {
        this.status = LeadStatus.REPLIED;
    }

    public void close() {
        this.status = LeadStatus.CLOSED;
    }

    public LeadStatus status() {
        return status;
    }

    public CompanyId companyId() {
        return companyId;
    }

    public ContactId contactId() {
        return contactId;
    }

    public LeadSource source() {
        return source;
    }

    public Instant createdAt() {
        return createdAt;
    }
}