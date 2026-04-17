package com.campusland.crm.infrastructure.integration.hunter;

import java.util.List;

public record HunterEnrichmentResponse(List<HunterContactDto> data) {
}