package com.campusland.crm.presentation.mapper;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.presentation.dto.company.CompanyResponse;

public final class CompanyApiMapper {

    private CompanyApiMapper() {}

    public static CompanyResponse toResponse(Company c) {
        String linkedin = c.linkedinUrl() != null ? c.linkedinUrl().value() : null;
        return new CompanyResponse(
                c.id().value(), c.name().value(), c.industry(), c.size(),
                linkedin, c.website(), c.country(),
                c.department(), c.assignedTo(), c.contactStatus(), c.createdAt(),
                c.nit(), c.phones(), c.emails(), c.address(),
                c.legalRep(), c.companyState(), c.description()
        );
    }
}
