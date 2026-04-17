package com.campusland.crm.domain.policy;

import com.campusland.crm.domain.contact.EmailAddress;

public interface EmailValidationPolicy {
    boolean isValid(EmailAddress email);
    boolean isGeneric(EmailAddress email);
}