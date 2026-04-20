package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.domain.interaction.Interaction;
import com.campusland.crm.infrastructure.persistence.entity.InteractionEntity;
import com.campusland.crm.infrastructure.persistence.repository.InteractionJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class InteractionRepositoryAdapter {

    private final InteractionJpaRepository repository;

    public InteractionRepositoryAdapter(InteractionJpaRepository repository) {
        this.repository = repository;
    }

    public Interaction save(Interaction interaction) {
        InteractionEntity entity = new InteractionEntity(
                interaction.id(), interaction.companyId(), interaction.userId(),
                interaction.type(), interaction.notes(), interaction.createdAt()
        );
        InteractionEntity saved = repository.save(entity);
        return Interaction.rehydrate(saved.getId(), saved.getCompanyId(), saved.getUserId(),
                saved.getType(), saved.getNotes(), saved.getCreatedAt());
    }

    public List<Interaction> findByCompanyId(UUID companyId) {
        return repository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(e -> Interaction.rehydrate(e.getId(), e.getCompanyId(), e.getUserId(),
                        e.getType(), e.getNotes(), e.getCreatedAt()))
                .toList();
    }
}
