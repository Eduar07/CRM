package com.campusland.crm.infrastructure.integration.microsoft;

import com.campusland.crm.application.port.out.MicrosoftOAuthPort;
import com.campusland.crm.infrastructure.exception.ExternalIntegrationException;
import com.campusland.crm.infrastructure.integration.microsoft.dto.TokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class MicrosoftOAuthAdapter implements MicrosoftOAuthPort {

    private final WebClient webClient;
    private final String baseUrl;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;

    public MicrosoftOAuthAdapter(WebClient.Builder builder,
                                 @Value("${integrations.microsoft.oauth-base-url}") String baseUrl,
                                 @Value("${integrations.microsoft.client-id}") String clientId,
                                 @Value("${integrations.microsoft.client-secret}") String clientSecret,
                                 @Value("${integrations.microsoft.redirect-uri}") String redirectUri) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    @Override
    public String getAuthorizationUrl(String userId) {
        return baseUrl + "/oauth2/v2.0/authorize"
                + "?client_id=" + clientId
                + "&response_type=code"
                + "&redirect_uri=" + redirectUri
                + "&scope=offline_access%20User.Read%20Calendars.ReadWrite"
                + "&state=" + userId;
    }

    @Override
    public String exchangeCodeForToken(String authorizationCode) {
        try {
            TokenResponse response = webClient.post()
                    .uri("/oauth2/v2.0/token")
                    .bodyValue("""
                            client_id=%s&
                            client_secret=%s&
                            code=%s&
                            grant_type=authorization_code&
                            redirect_uri=%s&
                            scope=offline_access%%20User.Read%%20Calendars.ReadWrite
                            """.formatted(clientId, clientSecret, authorizationCode, redirectUri))
                    .retrieve()
                    .bodyToMono(TokenResponse.class)
                    .block();

            if (response == null) {
                throw new ExternalIntegrationException("Respuesta vacía al intercambiar token Microsoft");
            }

            return response.access_token();
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error intercambiando token Microsoft", ex);
        }
    }

    @Override
    public boolean revokeToken(String accessToken) {
        try {
            webClient.post()
                    .uri("/oauth2/v2.0/logout")
                    .bodyValue(accessToken)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return true;
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error revocando token Microsoft", ex);
        }
    }
}
