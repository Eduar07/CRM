package com.campusland.crm.infrastructure.persistence.mapper;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.meeting.Meeting;
import com.campusland.crm.domain.meeting.MeetingId;
import com.campusland.crm.domain.meeting.MeetingStatus;
import com.campusland.crm.domain.meeting.MeetingTitle;
import com.campusland.crm.domain.meeting.TimeRange;
import com.campusland.crm.domain.user.UserId;
import com.campusland.crm.infrastructure.persistence.entity.MeetingEntity;

public final class MeetingMapper {

    private MeetingMapper() {
    }

    public static MeetingEntity toEntity(Meeting domain) {
        return new MeetingEntity(
                domain.id().value(),
                domain.companyId().value(),
                domain.contactId().value(),
                domain.userId().value(),
                domain.title().value(),
                domain.description(),
                domain.timeRange().start(),
                domain.timeRange().end(),
                domain.meetingLink(),
                domain.status().name()
        );
    }

    public static Meeting toDomain(MeetingEntity entity) {
        return Meeting.rehydrate(
                new MeetingId(entity.getId()),
                new CompanyId(entity.getCompanyId()),
                new ContactId(entity.getContactId()),
                new UserId(entity.getUserId()),
                new MeetingTitle(entity.getTitle()),
                entity.getDescription(),
                new TimeRange(entity.getStartTime(), entity.getEndTime()),
                entity.getMeetingLink(),
                MeetingStatus.valueOf(entity.getStatus())
        );
    }
}