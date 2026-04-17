package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.lead.Lead;
import com.campusland.crm.domain.lead.LeadId;
import com.campusland.crm.domain.lead.LeadSource;
import com.campusland.crm.domain.lead.LeadStatus;
import com.campusland.crm.infrastructure.persistence.entity.LeadEntity;

public final class LeadMapper {

    private LeadMapper() {
    }

    public static LeadEntity toEntity(Lead domain) {
        return new LeadEntity(
                domain.id().value(),
                domain.companyId().value(),
                domain.contactId().value(),
                domain.source().name(),
                domain.status().name(),
                domain.createdAt()
        );
    }

    public static Lead toDomain(LeadEntity entity) {
        return Lead.rehydrate(
                new LeadId(entity.getId()),
                new CompanyId(entity.getCompanyId()),
                new ContactId(entity.getContactId()),
                LeadSource.valueOf(entity.getSource()),
                LeadStatus.valueOf(entity.getStatus()),
                entity.getCreatedAt()
        );
    }
}