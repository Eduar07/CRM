package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.company.LinkedInUrl;
import com.campusland.crm.infrastructure.persistence.entity.CompanyEntity;

public final class CompanyMapper {

    private CompanyMapper() {}

    public static CompanyEntity toEntity(Company d) {
        String linkedin = d.linkedinUrl() != null ? d.linkedinUrl().value() : null;
        return new CompanyEntity(
                d.id().value(), d.name().value(), d.industry(), d.size(),
                linkedin, d.website(), d.country(),
                d.department(), d.assignedTo(), d.contactStatus(), d.createdAt(),
                d.nit(), d.phones(), d.emails(), d.address(),
                d.legalRep(), d.companyState(), d.description()
        );
    }

    public static Company toDomain(CompanyEntity e) {
        LinkedInUrl linkedin = new LinkedInUrl(e.getLinkedinUrl());
        return Company.rehydrate(
                new CompanyId(e.getId()), new CompanyName(e.getName()),
                linkedin, e.getCountry(), e.getDepartment(),
                e.getIndustry(), e.getSize(), e.getWebsite(),
                e.getAssignedTo(), e.getContactStatus(), e.getCreatedAt(),
                e.getNit(), e.getPhones(), e.getEmails(), e.getAddress(),
                e.getLegalRep(), e.getCompanyState(), e.getDescription()
        );
    }
}
