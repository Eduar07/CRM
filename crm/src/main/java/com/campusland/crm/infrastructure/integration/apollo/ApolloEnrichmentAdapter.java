package com.campusland.crm.infrastructure.integration.apollo;

import com.campusland.crm.application.port.out.ApolloEnrichmentPort;
import com.campusland.crm.application.port.out.ExternalContactData;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ApolloEnrichmentAdapter implements ApolloEnrichmentPort {

    private final ApolloApiClient apolloApiClient;

    public ApolloEnrichmentAdapter(ApolloApiClient apolloApiClient) {
        this.apolloApiClient = apolloApiClient;
    }

    @Override
    public List<ExternalContactData> enrich(String companyName) {
        return apolloApiClient.enrich(companyName);
    }
}