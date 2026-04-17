package com.campusland.crm.domain.company;

import com.campusland.crm.domain.shared.DomainException;

public record LinkedInUrl(String value) {
    public LinkedInUrl {
        if (value == null || value.isBlank()) {
            throw new DomainException("linkedinUrl es obligatorio");
        }
        if (!value.startsWith("https://www.linkedin.com/")) {
            throw new DomainException("linkedinUrl inválido");
        }
    }
}
