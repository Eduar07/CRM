package com.campusland.crm.infrastructure.integration.email;

import com.campusland.crm.application.port.out.EmailMessage;
import com.campusland.crm.application.port.out.EmailSendResult;
import com.campusland.crm.infrastructure.exception.ExternalIntegrationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class EmailProviderClient {

    private final WebClient webClient;
    private final String baseUrl;
    private final String apiKey;

    public EmailProviderClient(WebClient.Builder builder,
                               @Value("${integrations.email.base-url}") String baseUrl,
                               @Value("${integrations.email.api-key}") String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public EmailSendResult send(EmailMessage message) {
        try {
            EmailProviderResponse response = webClient.post()
                    .uri("/send")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(new EmailProviderRequest(message.to(), message.subject(), message.content()))
                    .retrieve()
                    .bodyToMono(EmailProviderResponse.class)
                    .block();

            if (response == null) {
                return new EmailSendResult(false, null, "Respuesta vacía del proveedor de email");
            }

            return new EmailSendResult(
                    response.success(),
                    response.providerMessageId(),
                    response.errorMessage()
            );
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error enviando email en " + baseUrl, ex);
        }
    }
}