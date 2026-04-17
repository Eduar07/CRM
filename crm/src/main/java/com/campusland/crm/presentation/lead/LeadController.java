package com.campusland.crm.presentation.lead;

import com.campusland.crm.application.port.in.RegisterLeadCommand;
import com.campusland.crm.application.port.in.RegisterLeadUseCase;
import com.campusland.crm.application.port.out.LeadRepositoryPort;
import com.campusland.crm.domain.lead.LeadId;
import com.campusland.crm.presentation.dto.lead.CreateLeadRequest;
import com.campusland.crm.presentation.dto.lead.LeadResponse;
import com.campusland.crm.presentation.mapper.LeadApiMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final RegisterLeadUseCase registerLeadUseCase;
    private final LeadRepositoryPort leadRepositoryPort;

    public LeadController(RegisterLeadUseCase registerLeadUseCase,
                          LeadRepositoryPort leadRepositoryPort) {
        this.registerLeadUseCase = registerLeadUseCase;
        this.leadRepositoryPort = leadRepositoryPort;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PostMapping
    public ResponseEntity<LeadResponse> create(@Valid @RequestBody CreateLeadRequest request) {
        var lead = registerLeadUseCase.register(
                new RegisterLeadCommand(
                        request.companyId(),
                        request.contactId(),
                        request.source()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(LeadApiMapper.toResponse(lead));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<LeadResponse> getById(@PathVariable UUID id) {
        var lead = leadRepositoryPort.findById(new LeadId(id))
                .orElseThrow(() -> new IllegalArgumentException("Lead no encontrado"));

        return ResponseEntity.ok(LeadApiMapper.toResponse(lead));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping
    public ResponseEntity<List<LeadResponse>> findByCompany(@RequestParam String companyId) {
        var items = leadRepositoryPort.findByCompanyId(companyId)
                .stream()
                .map(LeadApiMapper::toResponse)
                .toList();

        return ResponseEntity.ok(items);
    }
}