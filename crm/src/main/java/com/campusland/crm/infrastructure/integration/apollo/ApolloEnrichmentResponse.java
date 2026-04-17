package com.campusland.crm.infrastructure.integration.apollo;

import java.util.List;

public record ApolloEnrichmentResponse(List<ApolloContactDto> contacts) {
}