package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.application.port.out.UserRepositoryPort;
import com.campusland.crm.domain.user.UserId;
import com.campusland.crm.domain.user.UserRole;
import com.campusland.crm.infrastructure.persistence.mapper.UserMapper;
import com.campusland.crm.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository repository;

    public UserRepositoryAdapter(UserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<UserRole> findRoleByUserId(UserId userId) {
        return repository.findById(userId.value()).map(UserMapper::toRole);
    }
}