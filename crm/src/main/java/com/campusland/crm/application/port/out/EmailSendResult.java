package com.campusland.crm.application.port.out;

public record EmailSendResult(
        boolean success,
        String providerMessageId,
        String errorMessage
) {
}