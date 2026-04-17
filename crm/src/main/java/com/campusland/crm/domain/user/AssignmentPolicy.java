package com.campusland.crm.domain.user;

import com.campusland.crm.domain.company.Company;

public interface AssignmentPolicy {
    UserRole assignTo(Company company);
}