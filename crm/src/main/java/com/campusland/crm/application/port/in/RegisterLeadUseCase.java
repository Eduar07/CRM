package com.campusland.crm.application.port.in;

import com.campusland.crm.domain.lead.Lead;

public interface RegisterLeadUseCase {
    Lead register(RegisterLeadCommand command);
}