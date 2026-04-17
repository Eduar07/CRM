package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.application.port.out.EmailRecordRepositoryPort;
import com.campusland.crm.domain.email.EmailRecord;
import com.campusland.crm.domain.email.EmailRecordId;
import com.campusland.crm.infrastructure.persistence.mapper.EmailRecordMapper;
import com.campusland.crm.infrastructure.persistence.repository.EmailRecordJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class EmailRecordRepositoryAdapter implements EmailRecordRepositoryPort {

    private final EmailRecordJpaRepository repository;

    public EmailRecordRepositoryAdapter(EmailRecordJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public EmailRecord save(EmailRecord emailRecord) {
        return EmailRecordMapper.toDomain(repository.save(EmailRecordMapper.toEntity(emailRecord)));
    }

    @Override
    public Optional<EmailRecord> findById(EmailRecordId id) {
        return repository.findById(id.value()).map(EmailRecordMapper::toDomain);
    }

    @Override
    public List<EmailRecord> findByContactId(String contactId) {
        return repository.findByContactId(UUID.fromString(contactId))
                .stream()
                .map(EmailRecordMapper::toDomain)
                .toList();
    }

    @Override
    public boolean alreadySentTo(String contactId) {
        return repository.existsByContactId(UUID.fromString(contactId));
    }
}