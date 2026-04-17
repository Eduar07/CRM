package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.lead.Lead;
import com.campusland.crm.domain.lead.LeadId;

import java.util.List;
import java.util.Optional;

public interface LeadRepositoryPort {
    Lead save(Lead lead);
    Optional<Lead> findById(LeadId id);
    List<Lead> findByCompanyId(String companyId);
}