package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.application.port.out.LeadRepositoryPort;
import com.campusland.crm.domain.lead.Lead;
import com.campusland.crm.domain.lead.LeadId;
import com.campusland.crm.infrastructure.persistence.mapper.LeadMapper;
import com.campusland.crm.infrastructure.persistence.repository.LeadJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class LeadRepositoryAdapter implements LeadRepositoryPort {

    private final LeadJpaRepository repository;

    public LeadRepositoryAdapter(LeadJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Lead save(Lead lead) {
        return LeadMapper.toDomain(repository.save(LeadMapper.toEntity(lead)));
    }

    @Override
    public Optional<Lead> findById(LeadId id) {
        return repository.findById(id.value()).map(LeadMapper::toDomain);
    }

    @Override
    public List<Lead> findByCompanyId(String companyId) {
        return repository.findByCompanyId(UUID.fromString(companyId))
                .stream()
                .map(LeadMapper::toDomain)
                .toList();
    }
}