package com.campusland.crm.domain.meeting;

import com.campusland.crm.domain.shared.DomainException;

import java.time.Instant;

public record TimeRange(Instant start, Instant end) {
    public TimeRange {
        if (start == null || end == null) {
            throw new DomainException("start y end son obligatorios");
        }
        if (!end.isAfter(start)) {
            throw new DomainException("end debe ser posterior a start");
        }
    }

    public boolean overlaps(TimeRange other) {
        return start.isBefore(other.end()) && end.isAfter(other.start());
    }
}