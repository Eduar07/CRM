package com.campusland.crm.infrastructure.persistence.repository;

import com.campusland.crm.infrastructure.persistence.entity.InteractionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InteractionJpaRepository extends JpaRepository<InteractionEntity, UUID> {
    List<InteractionEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
