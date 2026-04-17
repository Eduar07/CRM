package com.campusland.crm.infrastructure.integration.linkedin;

import com.campusland.crm.application.port.out.ExternalCompanyData;
import com.campusland.crm.infrastructure.exception.ExternalIntegrationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Component
public class LinkedInApiClient {

    private final WebClient webClient;
    private final String baseUrl;
    private final String apiKey;

    public LinkedInApiClient(WebClient.Builder builder,
                             @Value("${integrations.linkedin.base-url}") String baseUrl,
                             @Value("${integrations.linkedin.api-key}") String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public List<ExternalCompanyData> fetchCompaniesByCountry(String country) {
        try {
            LinkedInSearchResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/companies")
                            .queryParam("country", country)
                            .build())
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .bodyToMono(LinkedInSearchResponse.class)
                    .block();

            if (response == null || response.companies() == null) {
                return List.of();
            }

            return response.companies().stream()
                    .map(company -> new ExternalCompanyData(
                            company.name(),
                            company.linkedinUrl(),
                            company.country(),
                            company.department()
                    ))
                    .toList();
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error consultando LinkedIn en " + baseUrl, ex);
        }
    }
}