package com.campusland.crm.domain.policy;

import com.campusland.crm.domain.meeting.Meeting;
import com.campusland.crm.domain.meeting.TimeRange;

import java.util.List;

public interface MeetingConflictPolicy {
    boolean hasConflict(TimeRange range, List<Meeting> existingMeetings);
}