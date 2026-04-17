package com.campusland.crm.presentation.mapper;

import com.campusland.crm.domain.meeting.Meeting;
import com.campusland.crm.presentation.dto.meeting.MeetingResponse;

public final class MeetingApiMapper {

    private MeetingApiMapper() {
    }

    public static MeetingResponse toResponse(Meeting meeting) {
        return new MeetingResponse(
                meeting.id().value(),
                meeting.companyId().value(),
                meeting.contactId().value(),
                meeting.userId().value(),
                meeting.title().value(),
                meeting.description(),
                meeting.timeRange().start(),
                meeting.timeRange().end(),
                meeting.meetingLink(),
                meeting.status()
        );
    }
}