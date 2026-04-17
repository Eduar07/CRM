package com.campusland.crm.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface UserAuthenticationPort {
    Optional<UserAuthData> findByUsername(String username);
    Optional<UserAuthData> findById(UUID userId);
    void updatePasswordHash(UUID userId, String passwordHash);
    void updateMicrosoftTokens(UUID userId, String accessToken, String refreshToken);
}
