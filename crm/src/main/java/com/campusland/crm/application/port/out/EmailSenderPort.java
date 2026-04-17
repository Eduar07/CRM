package com.campusland.crm.application.port.out;

public interface EmailSenderPort {
    EmailSendResult send(EmailMessage message);
}