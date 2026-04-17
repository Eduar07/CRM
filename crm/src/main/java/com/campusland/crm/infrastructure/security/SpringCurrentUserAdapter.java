package com.campusland.crm.infrastructure.security;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.out.CurrentUserPort;
import com.campusland.crm.domain.user.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SpringCurrentUserAdapter implements CurrentUserPort {

    @Override
    public UUID userId() {
        return UUID.fromString(currentJwt().getClaimAsString("userId"));
    }

    @Override
    public String username() {
        return currentJwt().getClaimAsString("username");
    }

    @Override
    public UserRole role() {
        return UserRole.valueOf(currentJwt().getClaimAsString("role"));
    }

    private Jwt currentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ApplicationException("No hay un usuario autenticado");
        }
        return jwt;
    }
}