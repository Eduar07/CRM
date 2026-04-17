package com.campusland.crm.infrastructure.integration.microsoft;

import com.campusland.crm.application.port.out.CalendarMeetingResult;
import com.campusland.crm.application.port.out.MicrosoftCalendarPort;
import com.campusland.crm.domain.meeting.Meeting;
import org.springframework.stereotype.Component;

@Component
public class MicrosoftCalendarAdapter implements MicrosoftCalendarPort {

    private final MicrosoftGraphClient microsoftGraphClient;

    public MicrosoftCalendarAdapter(MicrosoftGraphClient microsoftGraphClient) {
        this.microsoftGraphClient = microsoftGraphClient;
    }

    @Override
    public CalendarMeetingResult createMeeting(Meeting meeting) {
        return microsoftGraphClient.createMeeting(meeting);
    }

    @Override
    public void cancelMeeting(String externalMeetingId) {
        microsoftGraphClient.cancelMeeting(externalMeetingId);
    }
}