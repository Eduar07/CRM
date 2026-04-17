package com.campusland.crm.application.port.in;

import com.campusland.crm.domain.company.Company;

import java.util.List;

public interface ImportCompaniesFromLinkedInUseCase {
    List<Company> importByCountry(ImportCompaniesFromLinkedInCommand command);
}