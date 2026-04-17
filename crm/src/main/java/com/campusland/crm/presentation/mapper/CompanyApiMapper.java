package com.campusland.crm.presentation.mapper;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.company.LinkedInUrl;
import com.campusland.crm.presentation.dto.company.CompanyResponse;
import com.campusland.crm.presentation.dto.company.CreateCompanyRequest;

public final class CompanyApiMapper {

    private CompanyApiMapper() {
    }

    public static CompanyName toName(CreateCompanyRequest request) {
        return new CompanyName(request.name());
    }

    public static LinkedInUrl toLinkedInUrl(CreateCompanyRequest request) {
        return new LinkedInUrl(request.linkedinUrl());
    }

    public static CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
                company.id().value(),
                company.name().value(),
                company.linkedinUrl().value(),
                company.country(),
                company.department(),
                company.createdAt()
        );
    }
}