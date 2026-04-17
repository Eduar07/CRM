package com.campusland.crm.infrastructure.persistence.repository;

import com.campusland.crm.infrastructure.persistence.entity.ContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContactJpaRepository extends JpaRepository<ContactEntity, UUID> {
    List<ContactEntity> findByCompanyId(UUID companyId);
}
