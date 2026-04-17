package com.campusland.crm.application.port.in;

public record SendProspectionEmailCommand(
        String companyId,
        String contactId
) {
}
