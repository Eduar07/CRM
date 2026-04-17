package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.application.port.out.UserAuthData;
import com.campusland.crm.application.port.out.UserAuthenticationPort;
import com.campusland.crm.infrastructure.persistence.entity.UserEntity;
import com.campusland.crm.infrastructure.persistence.mapper.UserSecurityMapper;
import com.campusland.crm.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
@Transactional
public class UserAuthenticationAdapter implements UserAuthenticationPort {

    private final UserJpaRepository repository;

    public UserAuthenticationAdapter(UserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<UserAuthData> findByUsername(String username) {
        return repository.findByUsername(username).map(UserSecurityMapper::toAuthData);
    }

    @Override
    public Optional<UserAuthData> findById(UUID userId) {
        return repository.findById(userId).map(UserSecurityMapper::toAuthData);
    }

    @Override
    public void updatePasswordHash(UUID userId, String passwordHash) {
        UserEntity entity = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        entity.setPasswordHash(passwordHash);
        repository.save(entity);
    }

    @Override
    public void updateMicrosoftTokens(UUID userId, String accessToken, String refreshToken) {
        UserEntity entity = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        entity.setMsAccessToken(accessToken);
        entity.setMsRefreshToken(refreshToken);
        repository.save(entity);
    }
}