package com.campusland.crm.infrastructure.integration.apollo;

import com.campusland.crm.application.port.out.ExternalContactData;
import com.campusland.crm.domain.contact.ContactRole;
import com.campusland.crm.infrastructure.exception.ExternalIntegrationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Component
public class ApolloApiClient {

    private final WebClient webClient;
    private final String baseUrl;
    private final String apiKey;

    public ApolloApiClient(WebClient.Builder builder,
                           @Value("${integrations.apollo.base-url}") String baseUrl,
                           @Value("${integrations.apollo.api-key}") String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public List<ExternalContactData> enrich(String companyName) {
        try {
            ApolloEnrichmentResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/people/search")
                            .queryParam("company", companyName)
                            .build())
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .bodyToMono(ApolloEnrichmentResponse.class)
                    .block();

            if (response == null || response.contacts() == null) {
                return List.of();
            }

            return response.contacts().stream()
                    .map(contact -> new ExternalContactData(
                            contact.name(),
                            contact.email(),
                            ContactRole.valueOf(contact.role()),
                            "APOLLO"
                    ))
                    .toList();
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error consultando Apollo en " + baseUrl, ex);
        }
    }
}