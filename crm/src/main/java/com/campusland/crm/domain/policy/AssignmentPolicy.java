package com.campusland.crm.domain.policy;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.user.UserRole;

public interface AssignmentPolicy {
    UserRole assignTo(Company company);
}