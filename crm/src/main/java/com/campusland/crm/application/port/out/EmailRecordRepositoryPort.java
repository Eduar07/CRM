package com.campusland.crm.application.port.out;

import com.campusland.crm.domain.email.EmailRecord;
import com.campusland.crm.domain.email.EmailRecordId;

import java.util.List;
import java.util.Optional;

public interface EmailRecordRepositoryPort {
    EmailRecord save(EmailRecord emailRecord);
    Optional<EmailRecord> findById(EmailRecordId id);
    List<EmailRecord> findByContactId(String contactId);

    /** @deprecated Use {@link #sentToWithinDays(String, int)} con ventana específica */
    @Deprecated
    boolean alreadySentTo(String contactId);

    /**
     * Devuelve true si se envió un email al contacto en los últimos N días.
     * Esta es la señal que usa el use case para evitar spam pero permitir reenvío después de la ventana.
     */
    boolean sentToWithinDays(String contactId, int days);
}
