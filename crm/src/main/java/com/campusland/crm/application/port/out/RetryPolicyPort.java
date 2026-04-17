package com.campusland.crm.application.port.out;

public interface RetryPolicyPort {
    int maxAttempts();
    boolean shouldRetry(int attemptNumber);
}