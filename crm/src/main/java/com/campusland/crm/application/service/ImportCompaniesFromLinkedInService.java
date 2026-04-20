package com.campusland.crm.application.service;

import com.campusland.crm.application.port.in.ImportCompaniesFromLinkedInCommand;
import com.campusland.crm.application.port.in.ImportCompaniesFromLinkedInUseCase;
import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.application.port.out.LinkedInLeadCapturePort;
import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.company.LinkedInUrl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ImportCompaniesFromLinkedInService implements ImportCompaniesFromLinkedInUseCase {

    private final LinkedInLeadCapturePort linkedInLeadCapturePort;
    private final CompanyRepositoryPort companyRepositoryPort;

    public ImportCompaniesFromLinkedInService(LinkedInLeadCapturePort linkedInLeadCapturePort,
                                              CompanyRepositoryPort companyRepositoryPort) {
        this.linkedInLeadCapturePort = linkedInLeadCapturePort;
        this.companyRepositoryPort = companyRepositoryPort;
    }

    @Override
    public List<Company> importByCountry(ImportCompaniesFromLinkedInCommand command) {
        List<Company> savedCompanies = new ArrayList<>();

        for (var ext : linkedInLeadCapturePort.fetchCompaniesByCountry(command.country())) {
            LinkedInUrl linkedinUrl = new LinkedInUrl(ext.linkedinUrl());

            if (companyRepositoryPort.existsByLinkedInUrl(linkedinUrl)) {
                continue;
            }

            // Asignar vendedor según departamento
            String assignedTo = assignByDepartment(ext.department());

            Company company = Company.create(
                    new CompanyName(ext.name()),
                    linkedinUrl,
                    ext.country(),
                    ext.department(),
                    null,   // industry — no disponible desde LinkedIn scraper
                    null,   // size
                    null,   // website
                    assignedTo
            );

            savedCompanies.add(companyRepositoryPort.save(company));
        }

        return savedCompanies;
    }

    private String assignByDepartment(String department) {
        if (department == null) return "superadmin";
        return switch (department.toLowerCase()) {
            case "santander" -> "marcela";
            case "norte de santander" -> "karolain";
            default -> "superadmin";
        };
    }
}
