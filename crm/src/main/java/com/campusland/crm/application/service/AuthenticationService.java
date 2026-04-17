package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.in.LoginCommand;
import com.campusland.crm.application.port.in.LoginResult;
import com.campusland.crm.application.port.in.LoginUseCase;
import com.campusland.crm.application.port.out.TokenIssuerPort;
import com.campusland.crm.application.port.out.UserAuthenticationPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthenticationService implements LoginUseCase {

    private final UserAuthenticationPort userAuthenticationPort;
    private final PasswordEncoder passwordEncoder;
    private final TokenIssuerPort tokenIssuerPort;

    public AuthenticationService(UserAuthenticationPort userAuthenticationPort,
                                 PasswordEncoder passwordEncoder,
                                 TokenIssuerPort tokenIssuerPort) {
        this.userAuthenticationPort = userAuthenticationPort;
        this.passwordEncoder = passwordEncoder;
        this.tokenIssuerPort = tokenIssuerPort;
    }

    @Override
    public LoginResult login(LoginCommand command) {
        var user = userAuthenticationPort.findByUsername(command.username())
                .orElseThrow(() -> new ApplicationException("Credenciales inválidas"));

        if (!user.active()) {
            throw new ApplicationException("Usuario inactivo");
        }

        if (user.passwordHash() == null || user.passwordHash().isBlank()) {
            throw new ApplicationException("El usuario no tiene contraseña configurada");
        }

        if (!passwordEncoder.matches(command.password(), user.passwordHash())) {
            throw new ApplicationException("Credenciales inválidas");
        }

        var token = tokenIssuerPort.generateToken(user);

        return new LoginResult(
                user.id(),
                user.username(),
                user.role(),
                token.token(),
                token.expiresAt()
        );
    }
}