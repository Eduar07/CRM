package com.campusland.crm.domain.meeting;

import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.shared.AggregateRoot;
import com.campusland.crm.domain.shared.DomainException;
import com.campusland.crm.domain.user.UserId;

import java.time.Instant;

public class Meeting extends AggregateRoot<MeetingId> {

    private final CompanyId companyId;
    private final ContactId contactId;
    private final UserId userId;
    private final MeetingTitle title;
    private final String description;
    private final TimeRange timeRange;
    private String meetingLink;
    private MeetingStatus status;

    private Meeting(MeetingId id,
                    CompanyId companyId,
                    ContactId contactId,
                    UserId userId,
                    MeetingTitle title,
                    String description,
                    TimeRange timeRange,
                    String meetingLink,
                    MeetingStatus status) {
        super(id);
        this.companyId = companyId;
        this.contactId = contactId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.timeRange = timeRange;
        this.meetingLink = meetingLink;
        this.status = status;
    }

    public static Meeting schedule(CompanyId companyId,
                                   ContactId contactId,
                                   UserId userId,
                                   MeetingTitle title,
                                   String description,
                                   TimeRange timeRange,
                                   String meetingLink) {
        if (companyId == null || contactId == null || userId == null) {
            throw new DomainException("companyId, contactId y userId son obligatorios");
        }
        if (timeRange.start().isBefore(Instant.now())) {
            throw new DomainException("No se puede agendar una reunión en el pasado");
        }
        return new Meeting(
                MeetingId.newId(),
                companyId,
                contactId,
                userId,
                title,
                description,
                timeRange,
                meetingLink,
                MeetingStatus.SCHEDULED
        );
    }

    public static Meeting rehydrate(MeetingId id,
                                    CompanyId companyId,
                                    ContactId contactId,
                                    UserId userId,
                                    MeetingTitle title,
                                    String description,
                                    TimeRange timeRange,
                                    String meetingLink,
                                    MeetingStatus status) {
        return new Meeting(id, companyId, contactId, userId, title, description, timeRange, meetingLink, status);
    }

    
    public void updateMeetingLink(String meetingLink) {
    this.meetingLink = meetingLink;
    }

    public void cancel() {
        this.status = MeetingStatus.CANCELED;
    }

    public MeetingStatus status() {
        return status;
    }

    public CompanyId companyId() {
        return companyId;
    }

    public ContactId contactId() {
        return contactId;
    }

    public UserId userId() {
        return userId;
    }

    public MeetingTitle title() {
        return title;
    }

    public String description() {
        return description;
    }

    public TimeRange timeRange() {
        return timeRange;
    }

    public String meetingLink() {
        return meetingLink;
    }

}
