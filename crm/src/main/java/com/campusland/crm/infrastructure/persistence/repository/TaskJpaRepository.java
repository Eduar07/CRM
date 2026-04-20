package com.campusland.crm.infrastructure.persistence.repository;

import com.campusland.crm.infrastructure.persistence.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaskJpaRepository extends JpaRepository<TaskEntity, UUID> {
    List<TaskEntity> findByUserIdOrderByDueDateAsc(UUID userId);
    List<TaskEntity> findByStatusOrderByDueDateAsc(String status);

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.userId = :userId AND t.status = 'PENDING'")
    long countPendingByUserId(UUID userId);

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.userId = :userId AND t.status = 'PENDING' AND t.dueDate <= :today")
    long countOverdueByUserId(UUID userId, LocalDate today);
}
