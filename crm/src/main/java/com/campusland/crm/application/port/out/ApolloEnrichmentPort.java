package com.campusland.crm.application.port.out;

import java.util.List;

public interface ApolloEnrichmentPort {
    List<ExternalContactData> enrich(String companyName);
}