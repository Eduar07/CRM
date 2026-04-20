package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.company.LinkedInUrl;

import java.util.List;
import java.util.Optional;

public interface CompanyRepositoryPort {
    Company save(Company company);
    Optional<Company> findById(CompanyId id);
    Optional<Company> findByLinkedInUrl(LinkedInUrl linkedinUrl);
    List<Company> findAll();
    List<Company> findByDepartment(String department);
    List<Company> findByAssignedTo(String username);
    boolean existsByLinkedInUrl(LinkedInUrl linkedinUrl);
    void deleteById(CompanyId id);
}
