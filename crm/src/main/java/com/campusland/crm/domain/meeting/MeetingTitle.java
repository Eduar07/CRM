package com.campusland.crm.domain.meeting;

import com.campusland.crm.domain.shared.DomainException;

public record MeetingTitle(String value) {
    public MeetingTitle {
        if (value == null || value.isBlank()) {
            throw new DomainException("El título de la reunión es obligatorio");
        }
    }
}