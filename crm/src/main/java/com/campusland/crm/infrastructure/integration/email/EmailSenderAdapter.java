package com.campusland.crm.infrastructure.integration.email;

import com.campusland.crm.application.port.out.EmailMessage;
import com.campusland.crm.application.port.out.EmailSendResult;
import com.campusland.crm.application.port.out.EmailSenderPort;
import org.springframework.stereotype.Component;

@Component
public class EmailSenderAdapter implements EmailSenderPort {

    private final EmailProviderClient emailProviderClient;

    public EmailSenderAdapter(EmailProviderClient emailProviderClient) {
        this.emailProviderClient = emailProviderClient;
    }

    @Override
    public EmailSendResult send(EmailMessage message) {
        return emailProviderClient.send(message);
    }
}
