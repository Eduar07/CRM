package com.campusland.crm.presentation.mapper;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.presentation.dto.company.CompanyResponse;

public final class CompanyApiMapper {

    private CompanyApiMapper() {}

    public static CompanyResponse toResponse(Company c) {
        return new CompanyResponse(
                c.id().value(), c.name().value(), c.industry(), c.size(),
                c.linkedinUrl().value(), c.website(), c.country(),
                c.department(), c.assignedTo(), c.contactStatus(), c.createdAt()
        );
    }
}
