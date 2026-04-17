package com.campusland.crm.infrastructure.integration.linkedin;

import com.campusland.crm.application.port.out.ExternalCompanyData;
import com.campusland.crm.application.port.out.LinkedInLeadCapturePort;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LinkedInLeadCaptureAdapter implements LinkedInLeadCapturePort {

    private final LinkedInApiClient linkedInApiClient;

    public LinkedInLeadCaptureAdapter(LinkedInApiClient linkedInApiClient) {
        this.linkedInApiClient = linkedInApiClient;
    }

    @Override
    public List<ExternalCompanyData> fetchCompaniesByCountry(String country) {
        return linkedInApiClient.fetchCompaniesByCountry(country);
    }
}