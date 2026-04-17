package com.campusland.crm.infrastructure.security;

import com.campusland.crm.application.port.out.TokenData;
import com.campusland.crm.application.port.out.TokenIssuerPort;
import com.campusland.crm.application.port.out.UserAuthData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class JwtTokenService implements TokenIssuerPort {

    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final long ttlMinutes;

    public JwtTokenService(JwtEncoder jwtEncoder,
                           @Value("${security.jwt.issuer:campusland-crm}") String issuer,
                           @Value("${security.jwt.ttl-minutes:120}") long ttlMinutes) {
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.ttlMinutes = ttlMinutes;
    }

    @Override
    public TokenData generateToken(UserAuthData user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(ttlMinutes * 60);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(user.username())
                .claim("userId", user.id().toString())
                .claim("username", user.username())
                .claim("role", user.role().name())
                .claim("roles", List.of(user.role().name()))
                .build();

        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        Jwt jwt = jwtEncoder.encode(JwtEncoderParameters.from(headers, claims));

        return new TokenData(jwt.getTokenValue(), expiresAt);
    }
}