package com.campusland.crm.presentation.automation;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.application.port.out.ContactRepositoryPort;
import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyName;
import com.campusland.crm.domain.company.LinkedInUrl;
import com.campusland.crm.domain.contact.Contact;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.contact.ContactName;
import com.campusland.crm.domain.contact.ContactRole;
import com.campusland.crm.domain.contact.EmailAddress;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/automation")
public class AutomationController {

    private static final Set<String> GENERIC_EMAIL_PREFIXES =
            Set.of("info", "contact", "contacto", "hello", "hola", "admin", "support", "ventas", "sales");

    private final CompanyRepositoryPort companyRepository;
    private final ContactRepositoryPort contactRepository;

    public AutomationController(CompanyRepositoryPort companyRepository,
                                ContactRepositoryPort contactRepository) {
        this.companyRepository = companyRepository;
        this.contactRepository = contactRepository;
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingest(@Valid @RequestBody IngestRequest req) {

        // 1. Asignar vendedor según departamento
        String assignedTo = assignByDepartment(req.department());

        // 2. Verificar duplicados por LinkedIn URL
        LinkedInUrl linkedInUrl = new LinkedInUrl(req.linkedinUrl());
        Optional<Company> existing = companyRepository.findByLinkedInUrl(linkedInUrl);

        Company company;
        boolean isNew = false;

        if (existing.isPresent()) {
            company = existing.get();
        } else {
            company = Company.create(
                    new CompanyName(req.companyName()),
                    linkedInUrl,
                    req.country() != null ? req.country() : "Colombia",
                    req.department(),
                    req.industry(),
                    req.size(),
                    req.website(),
                    assignedTo
            );
            company = companyRepository.save(company);
            isNew = true;
        }

        // 3. Verificar si el email es personalizado
        boolean hasPersonalEmail = isPersonalEmail(req.contactEmail());

        // 4. Guardar contacto si viene con datos
        boolean contactSaved = false;
        if (req.contactName() != null && !req.contactName().isBlank()) {
            try {
                Contact contact = Contact.create(
                        company.id(),
                        new ContactName(req.contactName()),
                        new EmailAddress(req.contactEmail() != null ? req.contactEmail() : ""),
                        ContactRole.valueOf(req.contactRole() != null ? req.contactRole() : "TALENT_MANAGER")
                );
                contactRepository.save(contact);
                contactSaved = true;
            } catch (Exception ignored) {
                // Continuar aunque el contacto falle
            }
        }

        return ResponseEntity.ok(Map.of(
                "companyId", company.id().value(),
                "isNew", isNew,
                "assignedTo", assignedTo,
                "hasPersonalEmail", hasPersonalEmail,
                "contactSaved", contactSaved
        ));
    }

    private String assignByDepartment(String department) {
        if (department == null) return "superadmin";
        return switch (department.toLowerCase()) {
            case "santander" -> "marcela";
            case "norte de santander" -> "karolain";
            default -> "superadmin";
        };
    }

    private boolean isPersonalEmail(String email) {
        if (email == null || email.isBlank()) return false;
        String prefix = email.split("@")[0].toLowerCase();
        return GENERIC_EMAIL_PREFIXES.stream().noneMatch(prefix::startsWith);
    }

    public record IngestRequest(
            @NotBlank String companyName,
            @NotBlank String linkedinUrl,
            String department,
            String country,
            String industry,
            String size,
            String website,
            String contactName,
            String contactEmail,
            String contactRole
    ) {}
}
