package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.company.LinkedInUrl;
import com.campusland.crm.infrastructure.persistence.entity.CompanyEntity;

public final class CompanyMapper {

    private CompanyMapper() {
    }

    public static CompanyEntity toEntity(Company domain) {
        return new CompanyEntity(
                domain.id().value(),
                domain.name().value(),
                domain.linkedinUrl().value(),
                domain.country(),
                domain.department(),
                domain.createdAt()
        );
    }

    public static Company toDomain(CompanyEntity entity) {
        return Company.rehydrate(
                new CompanyId(entity.getId()),
                new CompanyName(entity.getName()),
                new LinkedInUrl(entity.getLinkedinUrl()),
                entity.getCountry(),
                entity.getDepartment(),
                entity.getCreatedAt()
        );
    }
}