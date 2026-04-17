package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.port.in.ScheduleMeetingCommand;
import com.campusland.crm.application.port.in.ScheduleMeetingUseCase;
import com.campusland.crm.application.port.out.*;
import com.campusland.crm.domain.company.CompanyId;
import com.campusland.crm.domain.contact.ContactId;
import com.campusland.crm.domain.meeting.Meeting;
import com.campusland.crm.domain.meeting.MeetingTitle;
import com.campusland.crm.domain.meeting.TimeRange;
import com.campusland.crm.domain.user.UserId;
import com.campusland.crm.domain.user.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class ScheduleMeetingService implements ScheduleMeetingUseCase {

    private final CompanyRepositoryPort companyRepositoryPort;
    private final ContactRepositoryPort contactRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final MeetingRepositoryPort meetingRepositoryPort;
    private final MicrosoftCalendarPort microsoftCalendarPort;
    private final RetryPolicyPort retryPolicyPort;

    public ScheduleMeetingService(CompanyRepositoryPort companyRepositoryPort,
                                  ContactRepositoryPort contactRepositoryPort,
                                  UserRepositoryPort userRepositoryPort,
                                  MeetingRepositoryPort meetingRepositoryPort,
                                  MicrosoftCalendarPort microsoftCalendarPort,
                                  RetryPolicyPort retryPolicyPort) {
        this.companyRepositoryPort = companyRepositoryPort;
        this.contactRepositoryPort = contactRepositoryPort;
        this.userRepositoryPort = userRepositoryPort;
        this.meetingRepositoryPort = meetingRepositoryPort;
        this.microsoftCalendarPort = microsoftCalendarPort;
        this.retryPolicyPort = retryPolicyPort;
    }

    @Override
    public Meeting schedule(ScheduleMeetingCommand command) {
        CompanyId companyId = new CompanyId(UUID.fromString(command.companyId()));
        ContactId contactId = new ContactId(UUID.fromString(command.contactId()));
        UserId userId = new UserId(UUID.fromString(command.userId()));

        var company = companyRepositoryPort.findById(companyId)
                .orElseThrow(() -> new ApplicationException("La empresa no existe"));

        var contact = contactRepositoryPort.findById(contactId)
                .orElseThrow(() -> new ApplicationException("El contacto no existe"));

        if (!contact.companyId().value().equals(company.id().value())) {
            throw new ApplicationException("El contacto no pertenece a la empresa indicada");
        }

        UserRole userRole = userRepositoryPort.findRoleByUserId(userId)
                .orElseThrow(() -> new ApplicationException("El usuario no existe"));

        Instant start = Instant.parse(command.startTime());
        Instant end = Instant.parse(command.endTime());
        TimeRange range = new TimeRange(start, end);

        if (meetingRepositoryPort.existsOverlapByUserId(command.userId(), range)) {
            throw new ApplicationException("Ya existe una reunión solapada para este usuario");
        }

        Meeting meeting = Meeting.schedule(
                company.id(),
                contact.id(),
                userId,
                new MeetingTitle(command.title()),
                command.description(),
                range,
                command.meetingLink()
        );

        CalendarMeetingResult result = createWithRetry(meeting);

        if (result == null || !result.success()) {
            throw new ApplicationException(
                    result != null && result.errorMessage() != null
                            ? result.errorMessage()
                            : "No fue posible crear la reunión en Microsoft Calendar"
            );
        }

        if (result.meetingLink() != null && !result.meetingLink().isBlank()) {
            meeting.updateMeetingLink(result.meetingLink());
        }

        return meetingRepositoryPort.save(meeting);
    }

    private CalendarMeetingResult createWithRetry(Meeting meeting) {
        CalendarMeetingResult lastResult = null;

        for (int attempt = 1; attempt <= retryPolicyPort.maxAttempts(); attempt++) {
            try {
                lastResult = microsoftCalendarPort.createMeeting(meeting);
                if (lastResult != null && lastResult.success()) {
                    return lastResult;
                }
            } catch (Exception ex) {
                lastResult = new CalendarMeetingResult(false, null, null, ex.getMessage());
            }

            if (!retryPolicyPort.shouldRetry(attempt)) {
                break;
            }
        }

        return lastResult != null ? lastResult : new CalendarMeetingResult(false, null, null, "Error desconocido");
    }
}
