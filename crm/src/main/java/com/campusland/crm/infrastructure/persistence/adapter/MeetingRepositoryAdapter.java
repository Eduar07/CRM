package com.campusland.crm.infrastructure.persistence.adapter;

import com.campusland.crm.application.port.out.MeetingRepositoryPort;
import com.campusland.crm.domain.meeting.Meeting;
import com.campusland.crm.domain.meeting.MeetingId;
import com.campusland.crm.domain.meeting.TimeRange;
import com.campusland.crm.infrastructure.persistence.mapper.MeetingMapper;
import com.campusland.crm.infrastructure.persistence.repository.MeetingJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class MeetingRepositoryAdapter implements MeetingRepositoryPort {

    private final MeetingJpaRepository repository;

    public MeetingRepositoryAdapter(MeetingJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Meeting save(Meeting meeting) {
        return MeetingMapper.toDomain(repository.save(MeetingMapper.toEntity(meeting)));
    }

    @Override
    public Optional<Meeting> findById(MeetingId id) {
        return repository.findById(id.value()).map(MeetingMapper::toDomain);
    }

    @Override
    public List<Meeting> findByUserId(String userId) {
        return repository.findByUserId(UUID.fromString(userId))
                .stream()
                .map(MeetingMapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsOverlapByUserId(String userId, TimeRange range) {
        UUID uid = UUID.fromString(userId);
        return repository.findByUserId(uid)
                .stream()
                .map(MeetingMapper::toDomain)
                .anyMatch(existing -> existing.timeRange().overlaps(range));
    }
}