package com.campusland.crm.application.port.in;

import com.campusland.crm.domain.company.Company;

public interface CreateCompanyUseCase {
    Company create(CreateCompanyCommand command);
}