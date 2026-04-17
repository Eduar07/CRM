package com.campusland.crm.application.port.out;

import java.util.List;

public interface HunterEnrichmentPort {
    List<ExternalContactData> enrich(String companyDomain);
}