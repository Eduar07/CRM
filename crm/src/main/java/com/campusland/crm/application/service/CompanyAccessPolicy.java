package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.out.CurrentUserPort;
import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.user.UserRole;
import org.springframework.stereotype.Service;

@Service
public class CompanyAccessPolicy {

    private final CurrentUserPort currentUserPort;

    public CompanyAccessPolicy(CurrentUserPort currentUserPort) {
        this.currentUserPort = currentUserPort;
    }

    public void assertCanAccess(Company company) {
        if (!canAccess(company)) {
            throw new ApplicationException("No tienes permisos para ver o modificar esta empresa");
        }
    }

    public boolean canAccess(Company company) {
        UserRole role = currentUserPort.role();

        return switch (role) {
            case SUPER_ADMIN -> true;
            case KAROLAIN_ADMIN -> "Norte de Santander".equalsIgnoreCase(company.department());
            case MARCELA_ADMIN -> "Santander".equalsIgnoreCase(company.department());
        };
    }
}