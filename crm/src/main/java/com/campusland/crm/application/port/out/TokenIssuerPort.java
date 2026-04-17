package com.campusland.crm.application.port.out;

public interface TokenIssuerPort {
    TokenData generateToken(UserAuthData user);
}