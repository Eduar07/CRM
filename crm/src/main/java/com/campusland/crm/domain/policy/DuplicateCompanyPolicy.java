package com.campusland.crm.domain.policy;

import com.campusland.crm.domain.company.LinkedInUrl;

public interface DuplicateCompanyPolicy {
    boolean isDuplicate(LinkedInUrl linkedinUrl);
}