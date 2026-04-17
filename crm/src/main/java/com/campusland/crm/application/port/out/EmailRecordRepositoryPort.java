package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.email.EmailRecord;
import com.campusland.crm.domain.email.EmailRecordId;

import java.util.List;
import java.util.Optional;

public interface EmailRecordRepositoryPort {
    EmailRecord save(EmailRecord emailRecord);
    Optional<EmailRecord> findById(EmailRecordId id);
    List<EmailRecord> findByContactId(String contactId);
    boolean alreadySentTo(String contactId);
}