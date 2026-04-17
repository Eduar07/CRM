package com.campusland.crm.presentation.dto.email;

import com.campusland.crm.domain.email.EmailStatus;

import java.time.Instant;
import java.util.UUID;

public record EmailRecordResponse(
        UUID id,
        UUID companyId,
        UUID contactId,
        String toEmail,
        String subject,
        String content,
        EmailStatus status,
        Instant sentAt
) {
}