package com.campusland.crm.domain.company;

import com.campusland.crm.domain.shared.DomainException;

public record CompanyName(String value) {
    public CompanyName {
        if (value == null || value.isBlank()) {
            throw new DomainException("El nombre de la empresa es obligatorio");
        }
    }
}