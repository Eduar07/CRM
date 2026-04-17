package com.campusland.crm.domain.contact;

import com.campusland.crm.domain.shared.DomainException;

public record EmailAddress(String value) {
    public EmailAddress {
        if (value == null || value.isBlank()) {
            throw new DomainException("El email es obligatorio");
        }
        if (!value.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new DomainException("Email inválido");
        }
    }

    public boolean isGeneric() {
        String v = value.toLowerCase();
        return v.startsWith("info@")
                || v.startsWith("contact@")
                || v.startsWith("sales@")
                || v.startsWith("admin@")
                || v.startsWith("support@");
    }
}