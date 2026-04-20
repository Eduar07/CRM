package com.campusland.crm.presentation.company;

import com.campusland.crm.application.port.in.CreateCompanyCommand;
import com.campusland.crm.application.port.in.CreateCompanyUseCase;
import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.application.port.out.CurrentUserPort;
import com.campusland.crm.application.service.CompanyAccessPolicy;
import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.user.UserRole;
import com.campusland.crm.presentation.dto.company.CompanyResponse;
import com.campusland.crm.presentation.dto.company.CreateCompanyRequest;
import com.campusland.crm.presentation.dto.company.UpdateCompanyRequest;
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
    private final CurrentUserPort currentUserPort;
    private final CompanyAccessPolicy accessPolicy;

    public CompanyController(CreateCompanyUseCase createCompanyUseCase,
                             CompanyRepositoryPort companyRepositoryPort,
                             CurrentUserPort currentUserPort,
                             CompanyAccessPolicy accessPolicy) {
        this.createCompanyUseCase = createCompanyUseCase;
        this.companyRepositoryPort = companyRepositoryPort;
        this.currentUserPort = currentUserPort;
        this.accessPolicy = accessPolicy;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CreateCompanyRequest req) {
        var company = createCompanyUseCase.create(new CreateCompanyCommand(
                req.name(), req.linkedinUrl(), req.country(), req.department(),
                req.industry(), req.size(), req.website(), req.assignedTo()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(CompanyApiMapper.toResponse(company));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping
    public ResponseEntity<List<CompanyResponse>> findAll() {
        UserRole role = currentUserPort.role();

        List<Company> companies = switch (role) {
            case SUPER_ADMIN -> companyRepositoryPort.findAll();
            case MARCELA_ADMIN -> companyRepositoryPort.findByDepartment("Santander");
            case KAROLAIN_ADMIN -> companyRepositoryPort.findByDepartment("Norte de Santander");
        };

        return ResponseEntity.ok(companies.stream().map(CompanyApiMapper::toResponse).toList());
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        var company = companyRepositoryPort.findById(new CompanyId(id))
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        accessPolicy.assertCanAccess(company);
        return ResponseEntity.ok(CompanyApiMapper.toResponse(company));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(@PathVariable UUID id,
                                                   @RequestBody UpdateCompanyRequest req) {
        var entity = companyRepositoryPort.findById(new CompanyId(id))
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        accessPolicy.assertCanAccess(entity);

        // Aplicar cambios con rehydrate
        var updated = Company.rehydrate(
                entity.id(),
                req.name() != null ? new CompanyName(req.name()) : entity.name(),
                entity.linkedinUrl(),
                req.country() != null ? req.country() : entity.country(),
                req.department() != null ? req.department() : entity.department(),
                req.industry() != null ? req.industry() : entity.industry(),
                req.size() != null ? req.size() : entity.size(),
                req.website() != null ? req.website() : entity.website(),
                req.assignedTo() != null ? req.assignedTo() : entity.assignedTo(),
                req.contactStatus() != null ? req.contactStatus() : entity.contactStatus(),
                entity.createdAt()
        );

        return ResponseEntity.ok(CompanyApiMapper.toResponse(companyRepositoryPort.save(updated)));
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyRepositoryPort.findById(new CompanyId(id))
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        companyRepositoryPort.deleteById(new CompanyId(id));
        return ResponseEntity.noContent().build();
    }
}
