package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.in.CreateCompanyCommand;
import com.campusland.crm.application.port.in.CreateCompanyUseCase;
import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.company.LinkedInUrl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CreateCompanyService implements CreateCompanyUseCase {

    private final CompanyRepositoryPort companyRepositoryPort;

    public CreateCompanyService(CompanyRepositoryPort companyRepositoryPort) {
        this.companyRepositoryPort = companyRepositoryPort;
    }

    @Override
    public Company create(CreateCompanyCommand command) {
        LinkedInUrl linkedinUrl = new LinkedInUrl(command.linkedinUrl());

        if (companyRepositoryPort.existsByLinkedInUrl(linkedinUrl)) {
            throw new ApplicationException("La empresa ya existe con ese linkedinUrl");
        }

        Company company = Company.create(
                new CompanyName(command.name()),
                linkedinUrl,
                command.country(),
                command.department()
        );

        return companyRepositoryPort.save(company);
    }

}
