package com.campusland.crm.infrastructure.config;

import com.campusland.crm.domain.user.UserRole;
import com.campusland.crm.infrastructure.persistence.entity.UserEntity;
import com.campusland.crm.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class InitialUsersSeeder implements ApplicationRunner {

    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public InitialUsersSeeder(UserJpaRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedIfMissing("superadmin", "superadmin@campusland.com", UserRole.SUPER_ADMIN, "SuperAdmin123*");
        seedIfMissing("marcela", "marcela@campusland.com", UserRole.MARCELA_ADMIN, "Marcela123*");
        seedIfMissing("karolain", "karolain@campusland.com", UserRole.KAROLAIN_ADMIN, "Karolain123*");
    }

    private void seedIfMissing(String username, String email, UserRole role, String rawPassword) {
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            return;
        }

        UserEntity user = new UserEntity(
                UUID.randomUUID(),
                username,
                email,
                role.name(),
                passwordEncoder.encode(rawPassword),
                true,
                null,
                null
        );

        userRepository.save(user);
    }
}
