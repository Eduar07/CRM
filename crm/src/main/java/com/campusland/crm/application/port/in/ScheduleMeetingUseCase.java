package com.campusland.crm.application.port.in;

import com.campusland.crm.domain.meeting.Meeting;

public interface ScheduleMeetingUseCase {
    Meeting schedule(ScheduleMeetingCommand command);
}