package com.campusland.crm.presentation.email;

import com.campusland.crm.application.port.in.SendProspectionEmailCommand;
import com.campusland.crm.application.port.in.SendProspectionEmailUseCase;
import com.campusland.crm.application.port.out.EmailRecordRepositoryPort;
import com.campusland.crm.domain.email.EmailRecordId;
import com.campusland.crm.presentation.dto.email.EmailRecordResponse;
import com.campusland.crm.presentation.dto.email.SendEmailRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    private final SendProspectionEmailUseCase sendProspectionEmailUseCase;
    private final EmailRecordRepositoryPort emailRecordRepositoryPort;

    public EmailController(SendProspectionEmailUseCase sendProspectionEmailUseCase,
                           EmailRecordRepositoryPort emailRecordRepositoryPort) {
        this.sendProspectionEmailUseCase = sendProspectionEmailUseCase;
        this.emailRecordRepositoryPort = emailRecordRepositoryPort;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PostMapping("/prospection")
    public ResponseEntity<Void> send(@Valid @RequestBody SendEmailRequest request) {
        sendProspectionEmailUseCase.send(
                new SendProspectionEmailCommand(
                        request.companyId(),
                        request.contactId()
                )
        );

        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping
    public ResponseEntity<List<EmailRecordResponse>> findByContact(@RequestParam String contactId) {
        var items = emailRecordRepositoryPort.findByContactId(contactId)
                .stream()
                .map(email -> new EmailRecordResponse(
                        email.id().value(),
                        email.companyId().value(),
                        email.contactId().value(),
                        email.to().value(),
                        email.subject(),
                        email.content(),
                        email.status(),
                        email.sentAt()
                ))
                .toList();

        return ResponseEntity.ok(items);
    }
}