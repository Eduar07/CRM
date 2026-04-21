package com.campusland.crm.infrastructure.persistence.repository;

import com.campusland.crm.infrastructure.persistence.entity.EmailRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EmailRecordJpaRepository extends JpaRepository<EmailRecordEntity, UUID> {
    List<EmailRecordEntity> findByContactId(UUID contactId);
    boolean existsByContactId(UUID contactId);

    // FIX: permitir reenvío después de 7 días. Antes, cualquier email existente bloqueaba para siempre.
    boolean existsByContactIdAndSentAtAfter(UUID contactId, Instant since);
}
