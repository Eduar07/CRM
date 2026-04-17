package com.campusland.crm.application.port.in;

public record RegisterLeadCommand(
        String companyId,
        String contactId,
        String source
) {
}