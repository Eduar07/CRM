package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.user.UserId;
import com.campusland.crm.domain.user.UserRole;

import java.util.Optional;

public interface UserRepositoryPort {
    Optional<UserRole> findRoleByUserId(UserId userId);
}