package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.in.SendProspectionEmailCommand;
import com.campusland.crm.application.port.in.SendProspectionEmailUseCase;
import com.campusland.crm.application.port.out.*;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.email.EmailRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class SendProspectionEmailService implements SendProspectionEmailUseCase {

    private final CompanyRepositoryPort companyRepositoryPort;
    private final ContactRepositoryPort contactRepositoryPort;
    private final EmailRecordRepositoryPort emailRecordRepositoryPort;
    private final EmailSenderPort emailSenderPort;
    private final RetryPolicyPort retryPolicyPort;
    private final ProspectionEmailComposer prospectionEmailComposer;

    public SendProspectionEmailService(CompanyRepositoryPort companyRepositoryPort,
                                       ContactRepositoryPort contactRepositoryPort,
                                       EmailRecordRepositoryPort emailRecordRepositoryPort,
                                       EmailSenderPort emailSenderPort,
                                       RetryPolicyPort retryPolicyPort,
                                       ProspectionEmailComposer prospectionEmailComposer) {
        this.companyRepositoryPort = companyRepositoryPort;
        this.contactRepositoryPort = contactRepositoryPort;
        this.emailRecordRepositoryPort = emailRecordRepositoryPort;
        this.emailSenderPort = emailSenderPort;
        this.retryPolicyPort = retryPolicyPort;
        this.prospectionEmailComposer = prospectionEmailComposer;
    }

    @Override
    public void send(SendProspectionEmailCommand command) {
        CompanyId companyId = new CompanyId(UUID.fromString(command.companyId()));
        ContactId contactId = new ContactId(UUID.fromString(command.contactId()));

        var company = companyRepositoryPort.findById(companyId)
                .orElseThrow(() -> new ApplicationException("La empresa no existe"));

        var contact = contactRepositoryPort.findById(contactId)
                .orElseThrow(() -> new ApplicationException("El contacto no existe"));

        if (!contact.companyId().value().equals(company.id().value())) {
            throw new ApplicationException("El contacto no pertenece a la empresa indicada");
        }

        if (contact.email().isGeneric()) {
            throw new ApplicationException("No se puede enviar email automático a un correo genérico");
        }

        if (emailRecordRepositoryPort.alreadySentTo(contact.id().value().toString())) {
            throw new ApplicationException("Ya se envió un email previamente a este contacto");
        }

        String subject = prospectionEmailComposer.subject(contact.role(), company.name().value());
        String content = prospectionEmailComposer.content(contact.role(), contact.name().value(), company.name().value());

        EmailMessage message = new EmailMessage(
                contact.email().value(),
                subject,
                content
        );

        EmailSendResult result = sendWithRetry(message);

        EmailRecord record = result.success()
                ? EmailRecord.sent(company.id(), contact.id(), contact.email(), subject, content)
                : EmailRecord.failed(company.id(), contact.id(), contact.email(), subject, content);

        emailRecordRepositoryPort.save(record);

        if (!result.success()) {
            throw new ApplicationException(
                    result.errorMessage() != null ? result.errorMessage() : "No fue posible enviar el email"
            );
        }
    }

    private EmailSendResult sendWithRetry(EmailMessage message) {
        EmailSendResult lastResult = null;

        for (int attempt = 1; attempt <= retryPolicyPort.maxAttempts(); attempt++) {
            try {
                lastResult = emailSenderPort.send(message);
                if (lastResult != null && lastResult.success()) {
                    return lastResult;
                }
            } catch (Exception ex) {
                lastResult = new EmailSendResult(false, null, ex.getMessage());
            }

            if (!retryPolicyPort.shouldRetry(attempt)) {
                break;
            }
        }

        return lastResult != null ? lastResult : new EmailSendResult(false, null, "Error desconocido");
    }
}
