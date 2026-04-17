package com.campusland.crm.presentation.contact;

import com.campusland.crm.application.port.in.RegisterContactCommand;
import com.campusland.crm.application.port.in.RegisterContactUseCase;
import com.campusland.crm.application.port.out.ContactRepositoryPort;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.presentation.dto.contact.ContactResponse;
import com.campusland.crm.presentation.dto.contact.CreateContactRequest;
import com.campusland.crm.presentation.mapper.ContactApiMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final RegisterContactUseCase registerContactUseCase;
    private final ContactRepositoryPort contactRepositoryPort;

    public ContactController(RegisterContactUseCase registerContactUseCase,
                             ContactRepositoryPort contactRepositoryPort) {
        this.registerContactUseCase = registerContactUseCase;
        this.contactRepositoryPort = contactRepositoryPort;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PostMapping
    public ResponseEntity<ContactResponse> create(@Valid @RequestBody CreateContactRequest request) {
        var contact = registerContactUseCase.register(
                new RegisterContactCommand(
                        request.companyId(),
                        request.name(),
                        request.email(),
                        request.role()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ContactApiMapper.toResponse(contact));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getById(@PathVariable UUID id) {
        var contact = contactRepositoryPort.findById(new ContactId(id))
                .orElseThrow(() -> new IllegalArgumentException("Contacto no encontrado"));

        return ResponseEntity.ok(ContactApiMapper.toResponse(contact));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping
    public ResponseEntity<List<ContactResponse>> findByCompany(@RequestParam String companyId) {
        var items = contactRepositoryPort.findByCompanyId(companyId)
                .stream()
                .map(ContactApiMapper::toResponse)
                .toList();

        return ResponseEntity.ok(items);
    }
}