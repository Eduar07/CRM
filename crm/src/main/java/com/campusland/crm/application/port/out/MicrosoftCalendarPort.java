package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.meeting.Meeting;

public interface MicrosoftCalendarPort {
    CalendarMeetingResult createMeeting(Meeting meeting);
    void cancelMeeting(String externalMeetingId);
}