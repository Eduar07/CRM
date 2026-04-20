package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.company.LinkedInUrl;
import com.campusland.crm.infrastructure.persistence.entity.CompanyEntity;

public final class CompanyMapper {

    private CompanyMapper() {}

    public static CompanyEntity toEntity(Company d) {
        return new CompanyEntity(
                d.id().value(), d.name().value(), d.industry(), d.size(),
                d.linkedinUrl().value(), d.website(), d.country(),
                d.department(), d.assignedTo(), d.contactStatus(), d.createdAt()
        );
    }

    public static Company toDomain(CompanyEntity e) {
        return Company.rehydrate(
                new CompanyId(e.getId()), new CompanyName(e.getName()),
                new LinkedInUrl(e.getLinkedinUrl()), e.getCountry(), e.getDepartment(),
                e.getIndustry(), e.getSize(), e.getWebsite(),
                e.getAssignedTo(), e.getContactStatus(), e.getCreatedAt()
        );
    }
}
