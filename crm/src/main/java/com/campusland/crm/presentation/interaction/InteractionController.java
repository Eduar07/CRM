package com.campusland.crm.presentation.interaction;

import com.campusland.crm.application.port.out.CurrentUserPort;
import com.campusland.crm.domain.interaction.Interaction;
import com.campusland.crm.infrastructure.persistence.adapter.InteractionRepositoryAdapter;
import com.campusland.crm.presentation.dto.interaction.CreateInteractionRequest;
import com.campusland.crm.presentation.dto.interaction.InteractionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interactions")
public class InteractionController {

    private final InteractionRepositoryAdapter repository;
    private final CurrentUserPort currentUserPort;

    public InteractionController(InteractionRepositoryAdapter repository, CurrentUserPort currentUserPort) {
        this.repository = repository;
        this.currentUserPort = currentUserPort;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping("/{companyId}")
    public ResponseEntity<List<InteractionResponse>> getByCompany(@PathVariable UUID companyId) {
        List<InteractionResponse> items = repository.findByCompanyId(companyId).stream()
                .map(this::toResponse).toList();
        return ResponseEntity.ok(items);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PostMapping
    public ResponseEntity<InteractionResponse> create(@Valid @RequestBody CreateInteractionRequest req) {
        Interaction interaction = Interaction.create(
                req.companyId(), currentUserPort.userId(), req.type(), req.notes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(repository.save(interaction)));
    }

    private InteractionResponse toResponse(Interaction i) {
        return new InteractionResponse(i.id(), i.companyId(), i.userId(), i.type(), i.notes(), i.createdAt());
    }
}
