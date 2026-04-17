package com.campusland.crm.application.service;

import com.campusland.crm.application.port.out.RetryPolicyPort;
import org.springframework.stereotype.Service;

@Service
public class FixedRetryPolicyService implements RetryPolicyPort {

    private static final int MAX_ATTEMPTS = 3;

    @Override
    public int maxAttempts() {
        return MAX_ATTEMPTS;
    }

    @Override
    public boolean shouldRetry(int attemptNumber) {
        return attemptNumber < MAX_ATTEMPTS;
    }
}