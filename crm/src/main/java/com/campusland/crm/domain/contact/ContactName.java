package com.campusland.crm.domain.contact;

import com.campusland.crm.domain.shared.DomainException;

public record ContactName(String value) {
    public ContactName {
        if (value == null || value.isBlank()) {
            throw new DomainException("El nombre del contacto es obligatorio");
        }
    }
}