package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.in.RegisterLeadCommand;
import com.campusland.crm.application.port.in.RegisterLeadUseCase;
import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.application.port.out.ContactRepositoryPort;
import com.campusland.crm.application.port.out.LeadRepositoryPort;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.lead.Lead;
import com.campusland.crm.domain.lead.LeadSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class RegisterLeadService implements RegisterLeadUseCase {

    private final CompanyRepositoryPort companyRepositoryPort;
    private final ContactRepositoryPort contactRepositoryPort;
    private final LeadRepositoryPort leadRepositoryPort;

    public RegisterLeadService(CompanyRepositoryPort companyRepositoryPort,
                               ContactRepositoryPort contactRepositoryPort,
                               LeadRepositoryPort leadRepositoryPort) {
        this.companyRepositoryPort = companyRepositoryPort;
        this.contactRepositoryPort = contactRepositoryPort;
        this.leadRepositoryPort = leadRepositoryPort;
    }

    @Override
    public Lead register(RegisterLeadCommand command) {
        CompanyId companyId = new CompanyId(UUID.fromString(command.companyId()));
        ContactId contactId = new ContactId(UUID.fromString(command.contactId()));

        var company = companyRepositoryPort.findById(companyId)
                .orElseThrow(() -> new ApplicationException("La empresa no existe"));

        var contact = contactRepositoryPort.findById(contactId)
                .orElseThrow(() -> new ApplicationException("El contacto no existe"));

        if (!contact.companyId().value().equals(company.id().value())) {
            throw new ApplicationException("El contacto no pertenece a la empresa indicada");
        }

        boolean alreadyRegistered = leadRepositoryPort.findByCompanyId(command.companyId())
                .stream()
                .anyMatch(lead -> lead.contactId().value().equals(contactId.value()));

        if (alreadyRegistered) {
            throw new ApplicationException("Ya existe un lead para esta empresa y este contacto");
        }

        LeadSource source;
        try {
            source = LeadSource.valueOf(command.source().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApplicationException("source inválido: " + command.source(), ex);
        }

        Lead lead = Lead.create(company.id(), contact.id(), source);
        return leadRepositoryPort.save(lead);
    }
}
