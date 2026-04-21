package com.campusland.crm.application.exception;

/**
 * Excepción para conflictos de negocio que mapean a HTTP 409 (Conflict).
 * Ejemplos: email ya enviado en los últimos 7 días, reunión solapada, linkedin duplicado.
 */
public class ConflictException extends ApplicationException {
    public ConflictException(String message) {
        super(message);
    }
}
