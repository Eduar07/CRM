package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.user.UserRole;
import com.campusland.crm.infrastructure.persistence.entity.UserEntity;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserRole toRole(UserEntity entity) {
        return UserRole.valueOf(entity.getRole());
    }
}