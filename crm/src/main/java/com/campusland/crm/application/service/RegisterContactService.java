package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.in.RegisterContactCommand;
import com.campusland.crm.application.port.in.RegisterContactUseCase;
import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.application.port.out.ContactRepositoryPort;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.Contact;
import com.campusland.crm.domain.contact.ContactName;
import com.campusland.crm.domain.contact.EmailAddress;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class RegisterContactService implements RegisterContactUseCase {

    private final CompanyRepositoryPort companyRepositoryPort;
    private final ContactRepositoryPort contactRepositoryPort;

    public RegisterContactService(CompanyRepositoryPort companyRepositoryPort,
                                 ContactRepositoryPort contactRepositoryPort) {
        this.companyRepositoryPort = companyRepositoryPort;
        this.contactRepositoryPort = contactRepositoryPort;
    }

    @Override
    public Contact register(RegisterContactCommand command) {
        CompanyId companyId = new CompanyId(UUID.fromString(command.companyId()));

        var company = companyRepositoryPort.findById(companyId)
                .orElseThrow(() -> new ApplicationException("La empresa no existe"));

        boolean alreadyExists = contactRepositoryPort.findByCompanyId(command.companyId())
                .stream()
                .anyMatch(contact -> contact.email().value().equalsIgnoreCase(command.email()));

        if (alreadyExists) {
            throw new ApplicationException("Ya existe un contacto con ese email en la empresa");
        }

        EmailAddress email = new EmailAddress(command.email());

        Contact contact = Contact.create(
                company.id(),
                new ContactName(command.name()),
                email,
                command.role()
        );

        return contactRepositoryPort.save(contact);
    }
}
