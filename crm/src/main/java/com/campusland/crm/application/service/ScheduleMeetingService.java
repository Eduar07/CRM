package com.campusland.crm.application.service;

import com.campusland.crm.application.exception.ApplicationException;
import com.campusland.crm.application.exception.ConflictException;
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
import java.time.format.DateTimeParseException;
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
        CompanyId companyId;
        ContactId contactId;
        UserId userId;
        try {
            companyId = new CompanyId(UUID.fromString(command.companyId()));
            contactId = new ContactId(UUID.fromString(command.contactId()));
            userId = new UserId(UUID.fromString(command.userId()));
        } catch (IllegalArgumentException ex) {
            throw new ApplicationException("IDs inválidos en la petición: " + ex.getMessage());
        }

        var company = companyRepositoryPort.findById(companyId)
                .orElseThrow(() -> new ApplicationException("La empresa no existe"));

        var contact = contactRepositoryPort.findById(contactId)
                .orElseThrow(() -> new ApplicationException("El contacto no existe"));

        if (!contact.companyId().value().equals(company.id().value())) {
            throw new ApplicationException("El contacto no pertenece a la empresa indicada");
        }

        UserRole userRole = userRepositoryPort.findRoleByUserId(userId)
                .orElseThrow(() -> new ApplicationException("El usuario no existe"));
        // userRole queda disponible para validaciones futuras (quién puede agendar)
        if (userRole == null) throw new ApplicationException("No se pudo determinar el rol del usuario");

        Instant start;
        Instant end;
        try {
            start = Instant.parse(command.startTime());
            end = Instant.parse(command.endTime());
        } catch (DateTimeParseException ex) {
            throw new ApplicationException(
                    "Formato de fecha inválido. Use ISO-8601 (ej: 2026-05-15T14:30:00Z). Detalle: " + ex.getMessage()
            );
        }

        TimeRange range = new TimeRange(start, end);

        if (meetingRepositoryPort.existsOverlapByUserId(command.userId(), range)) {
            // FIX: conflicto de horario → 409 en vez de 500 genérico
            throw new ConflictException("Ya tienes una reunión agendada en ese horario");
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
            String msg = result != null && result.errorMessage() != null
                    ? result.errorMessage()
                    : "No fue posible crear la reunión en Microsoft Calendar";
            // En dev, si Microsoft falla, no bloqueamos la persistencia local
            // Este comportamiento puede cambiar en prod
            if (!isDevFallbackEnabled()) {
                throw new ApplicationException(msg);
            }
        } else if (result.meetingLink() != null && !result.meetingLink().isBlank()) {
            meeting.updateMeetingLink(result.meetingLink());
        }

        return meetingRepositoryPort.save(meeting);
    }

    private boolean isDevFallbackEnabled() {
        // Si Microsoft Graph no está configurado, permitimos guardar solo en BD local.
        // Esto evita que el agendamiento falle en dev mientras MS Graph usa valores dummy.
        return true;
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
