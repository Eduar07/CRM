package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.company.LinkedInUrl;
import com.campusland.crm.infrastructure.persistence.mapper.CompanyMapper;
import com.campusland.crm.infrastructure.persistence.repository.CompanyJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CompanyRepositoryAdapter implements CompanyRepositoryPort {

    private final CompanyJpaRepository repository;

    public CompanyRepositoryAdapter(CompanyJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Company save(Company company) {
        return CompanyMapper.toDomain(repository.save(CompanyMapper.toEntity(company)));
    }

    @Override
    public Optional<Company> findById(CompanyId id) {
        return repository.findById(id.value()).map(CompanyMapper::toDomain);
    }

    @Override
    public Optional<Company> findByLinkedInUrl(LinkedInUrl linkedinUrl) {
        return repository.findByLinkedinUrl(linkedinUrl.value()).map(CompanyMapper::toDomain);
    }

    @Override
    public List<Company> findAll() {
        return repository.findAll().stream().map(CompanyMapper::toDomain).toList();
    }

    @Override
    public List<Company> findByDepartment(String department) {
        return repository.findByDepartmentIgnoreCase(department).stream()
                .map(CompanyMapper::toDomain).toList();
    }

    @Override
    public List<Company> findByAssignedTo(String username) {
        return repository.findByAssignedToIgnoreCase(username).stream()
                .map(CompanyMapper::toDomain).toList();
    }

    @Override
    public boolean existsByLinkedInUrl(LinkedInUrl linkedinUrl) {
        return repository.existsByLinkedinUrl(linkedinUrl.value());
    }

    @Override
    public void deleteById(CompanyId id) {
        repository.deleteById(id.value());
    }
}
