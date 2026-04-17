package com.campusland.crm.application.port.in;

import com.campusland.crm.domain.contact.Contact;

public interface RegisterContactUseCase {
    Contact register(RegisterContactCommand command);
}