package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.domain.task.Task;
import com.campusland.crm.infrastructure.persistence.entity.TaskEntity;
import com.campusland.crm.infrastructure.persistence.repository.TaskJpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class TaskRepositoryAdapter {

    private final TaskJpaRepository repository;

    public TaskRepositoryAdapter(TaskJpaRepository repository) {
        this.repository = repository;
    }

    public Task save(Task task) {
        TaskEntity entity = new TaskEntity(task.id(), task.userId(), task.companyId(),
                task.description(), task.dueDate(), task.status(), task.createdAt());
        TaskEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    public Optional<Task> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    public List<Task> findByUserId(UUID userId) {
        return repository.findByUserIdOrderByDueDateAsc(userId).stream()
                .map(this::toDomain).toList();
    }

    public long countPending(UUID userId) {
        return repository.countPendingByUserId(userId);
    }

    public long countOverdue(UUID userId) {
        return repository.countOverdueByUserId(userId, LocalDate.now());
    }

    private Task toDomain(TaskEntity e) {
        return Task.rehydrate(e.getId(), e.getUserId(), e.getCompanyId(),
                e.getDescription(), e.getDueDate(), e.getStatus(), e.getCreatedAt());
    }
}
