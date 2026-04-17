package com.campusland.crm.infrastructure.persistence.repository;

import com.campusland.crm.infrastructure.persistence.entity.LeadEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeadJpaRepository extends JpaRepository<LeadEntity, UUID> {
    List<LeadEntity> findByCompanyId(UUID companyId);
}