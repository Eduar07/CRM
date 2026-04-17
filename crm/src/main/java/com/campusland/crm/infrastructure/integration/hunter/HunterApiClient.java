package com.campusland.crm.infrastructure.integration.hunter;

import com.campusland.crm.application.port.out.ExternalContactData;
import com.campusland.crm.domain.contact.ContactRole;
import com.campusland.crm.infrastructure.exception.ExternalIntegrationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Component
public class HunterApiClient {

    private final WebClient webClient;
    private final String baseUrl;
    private final String apiKey;

    public HunterApiClient(WebClient.Builder builder,
                           @Value("${integrations.hunter.base-url}") String baseUrl,
                           @Value("${integrations.hunter.api-key}") String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public List<ExternalContactData> enrich(String companyDomain) {
        try {
            HunterEnrichmentResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/domain-search")
                            .queryParam("domain", companyDomain)
                            .build())
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .bodyToMono(HunterEnrichmentResponse.class)
                    .block();

            if (response == null || response.data() == null) {
                return List.of();
            }

            return response.data().stream()
                    .map(contact -> new ExternalContactData(
                            contact.name(),
                            contact.email(),
                            ContactRole.valueOf(contact.role()),
                            "HUNTER"
                    ))
                    .toList();
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error consultando Hunter en " + baseUrl, ex);
        }
    }
}