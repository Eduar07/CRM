package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.application.port.out.UserAuthData;
import com.campusland.crm.domain.user.UserRole;
import com.campusland.crm.infrastructure.persistence.entity.UserEntity;

public final class UserSecurityMapper {

    private UserSecurityMapper() {
    }

    public static UserAuthData toAuthData(UserEntity entity) {
        return new UserAuthData(
                entity.getId(),
                entity.getUsername(),
                entity.getPasswordHash(),
                UserRole.valueOf(entity.getRole()),
                entity.isActive()
        );
    }
}