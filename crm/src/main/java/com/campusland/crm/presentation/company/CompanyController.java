package com.campusland.crm.presentation.company;

import com.campusland.crm.application.port.in.CreateCompanyCommand;
import com.campusland.crm.application.port.in.CreateCompanyUseCase;
import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.presentation.dto.company.CompanyResponse;
import com.campusland.crm.presentation.dto.company.CreateCompanyRequest;
import com.campusland.crm.presentation.mapper.CompanyApiMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CreateCompanyUseCase createCompanyUseCase;
    private final CompanyRepositoryPort companyRepositoryPort;

    public CompanyController(CreateCompanyUseCase createCompanyUseCase,
                             CompanyRepositoryPort companyRepositoryPort) {
        this.createCompanyUseCase = createCompanyUseCase;
        this.companyRepositoryPort = companyRepositoryPort;
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CreateCompanyRequest request) {
        var company = createCompanyUseCase.create(
                new CreateCompanyCommand(
                        request.name(),
                        request.linkedinUrl(),
                        request.country(),
                        request.department()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(CompanyApiMapper.toResponse(company));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        var company = companyRepositoryPort.findById(new CompanyId(id))
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        return ResponseEntity.ok(CompanyApiMapper.toResponse(company));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping
    public ResponseEntity<List<CompanyResponse>> findAll() {
        var items = companyRepositoryPort.findAll()
                .stream()
                .map(CompanyApiMapper::toResponse)
                .toList();

        return ResponseEntity.ok(items);
    }
}