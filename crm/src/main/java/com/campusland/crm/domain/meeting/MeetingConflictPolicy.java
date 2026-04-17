package com.campusland.crm.domain.meeting;

import java.util.List;

public interface MeetingConflictPolicy {
    boolean hasConflict(TimeRange range, List<Meeting> existingMeetings);
}