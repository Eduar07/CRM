package com.campusland.crm.infrastructure.integration.linkedin;

import java.util.List;

public record LinkedInSearchResponse(List<LinkedInCompanyDto> companies) {
}