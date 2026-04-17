package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.application.port.out.ContactRepositoryPort;
import com.campusland.crm.domain.contact.Contact;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.infrastructure.persistence.mapper.ContactMapper;
import com.campusland.crm.infrastructure.persistence.repository.ContactJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ContactRepositoryAdapter implements ContactRepositoryPort {

    private final ContactJpaRepository repository;

    public ContactRepositoryAdapter(ContactJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Contact save(Contact contact) {
        return ContactMapper.toDomain(repository.save(ContactMapper.toEntity(contact)));
    }

    @Override
    public Optional<Contact> findById(ContactId id) {
        return repository.findById(id.value()).map(ContactMapper::toDomain);
    }

    @Override
    public List<Contact> findByCompanyId(String companyId) {
        return repository.findByCompanyId(UUID.fromString(companyId))
                .stream()
                .map(ContactMapper::toDomain)
                .toList();
    }
}