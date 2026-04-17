package com.campusland.crm.application.port.out;

public record EmailMessage(
        String to,
        String subject,
        String content
) {
}