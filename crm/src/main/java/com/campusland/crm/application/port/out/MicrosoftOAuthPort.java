package com.campusland.crm.application.port.out;

public interface MicrosoftOAuthPort {
    String getAuthorizationUrl(String userId);
    String exchangeCodeForToken(String authorizationCode);
    boolean revokeToken(String accessToken);
}