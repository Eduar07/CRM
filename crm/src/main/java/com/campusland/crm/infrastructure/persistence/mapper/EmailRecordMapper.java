package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.contact.EmailAddress;
import com.campusland.crm.domain.email.EmailRecord;
import com.campusland.crm.domain.email.EmailRecordId;
import com.campusland.crm.domain.email.EmailStatus;
import com.campusland.crm.infrastructure.persistence.entity.EmailRecordEntity;

public final class EmailRecordMapper {

    private EmailRecordMapper() {
    }

    public static EmailRecordEntity toEntity(EmailRecord domain) {
        return new EmailRecordEntity(
                domain.id().value(),
                domain.companyId().value(),
                domain.contactId().value(),
                domain.to().value(),
                domain.subject(),
                domain.content(),
                domain.status().name(),
                domain.sentAt()
        );
    }

    public static EmailRecord toDomain(EmailRecordEntity entity) {
        return EmailRecord.rehydrate(
                new EmailRecordId(entity.getId()),
                new CompanyId(entity.getCompanyId()),
                new ContactId(entity.getContactId()),
                new EmailAddress(entity.getToEmail()),
                entity.getSubject(),
                entity.getContent(),
                EmailStatus.valueOf(entity.getStatus()),
                entity.getSentAt()
        );
    }
}