package com.campusland.crm.application.port.in;

public record CreateCompanyCommand(
        String name,
        String linkedinUrl,
        String country,
        String department,
        String industry,
        String size,
        String website,
        String assignedTo,
        String nit,
        String phones,
        String emails,
        String address,
        String legalRep,
        String companyState,
        String description
) {}
