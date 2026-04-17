package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.user.UserRole;

import java.util.UUID;

public interface CurrentUserPort {
    UUID userId();
    String username();
    UserRole role();
}