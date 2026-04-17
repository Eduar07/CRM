package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.meeting.Meeting;
import com.campusland.crm.domain.meeting.MeetingId;
import com.campusland.crm.domain.meeting.TimeRange;

import java.util.List;
import java.util.Optional;

public interface MeetingRepositoryPort {
    Meeting save(Meeting meeting);
    Optional<Meeting> findById(MeetingId id);
    List<Meeting> findByUserId(String userId);
    boolean existsOverlapByUserId(String userId, TimeRange range);
}