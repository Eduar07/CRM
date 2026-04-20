package com.campusland.crm.presentation.task;

import com.campusland.crm.application.port.out.CurrentUserPort;
import com.campusland.crm.domain.task.Task;
import com.campusland.crm.infrastructure.persistence.adapter.TaskRepositoryAdapter;
import com.campusland.crm.presentation.dto.task.CreateTaskRequest;
import com.campusland.crm.presentation.dto.task.TaskResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepositoryAdapter repository;
    private final CurrentUserPort currentUserPort;

    public TaskController(TaskRepositoryAdapter repository, CurrentUserPort currentUserPort) {
        this.repository = repository;
        this.currentUserPort = currentUserPort;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getMyTasks() {
        List<TaskResponse> items = repository.findByUserId(currentUserPort.userId())
                .stream().map(this::toResponse).toList();
        return ResponseEntity.ok(items);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest req) {
        Task task = Task.create(currentUserPort.userId(), req.companyId(), req.description(), req.dueDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(repository.save(task)));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PutMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> complete(@PathVariable UUID id) {
        Task task = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        task.complete();
        return ResponseEntity.ok(toResponse(repository.save(task)));
    }

    private TaskResponse toResponse(Task t) {
        return new TaskResponse(t.id(), t.userId(), t.companyId(),
                t.description(), t.dueDate(), t.status(), t.createdAt());
    }
}
