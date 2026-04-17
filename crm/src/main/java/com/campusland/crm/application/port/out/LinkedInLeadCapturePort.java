package com.campusland.crm.application.port.out;

import java.util.List;

public interface LinkedInLeadCapturePort {
    List<ExternalCompanyData> fetchCompaniesByCountry(String country);
}