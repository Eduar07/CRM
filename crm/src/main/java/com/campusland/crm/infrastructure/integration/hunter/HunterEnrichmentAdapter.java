package com.campusland.crm.infrastructure.integration.hunter;

import com.campusland.crm.application.port.out.ExternalContactData;
import com.campusland.crm.application.port.out.HunterEnrichmentPort;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class HunterEnrichmentAdapter implements HunterEnrichmentPort {

    private final HunterApiClient hunterApiClient;

    public HunterEnrichmentAdapter(HunterApiClient hunterApiClient) {
        this.hunterApiClient = hunterApiClient;
    }

    @Override
    public List<ExternalContactData> enrich(String companyDomain) {
        return hunterApiClient.enrich(companyDomain);
    }
}