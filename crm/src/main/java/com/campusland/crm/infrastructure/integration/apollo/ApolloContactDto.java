package com.campusland.crm.infrastructure.integration.apollo;

public record ApolloContactDto(
        String name,
        String email,
        String role
) {
}