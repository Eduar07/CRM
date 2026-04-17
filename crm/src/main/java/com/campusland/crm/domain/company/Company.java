package com.campusland.crm.domain.company;

import com.campusland.crm.domain.shared.AggregateRoot;
import com.campusland.crm.domain.shared.DomainException;

import java.time.Instant;

public class Company extends AggregateRoot<CompanyId> {

    private CompanyName name;
    private LinkedInUrl linkedinUrl;
    private String country;
    private String department;
    private Instant createdAt;

    private Company(CompanyId id,
                    CompanyName name,
                    LinkedInUrl linkedinUrl,
                    String country,
                    String department,
                    Instant createdAt) {
        super(id);
        this.name = name;
        this.linkedinUrl = linkedinUrl;
        this.country = country;
        this.department = department;
        this.createdAt = createdAt;
    }

    public static Company create(CompanyName name,
                                 LinkedInUrl linkedinUrl,
                                 String country,
                                 String department) {
        if (country == null || country.isBlank()) {
            throw new DomainException("El país es obligatorio");
        }
        return new Company(
                CompanyId.newId(),
                name,
                linkedinUrl,
                country,
                department,
                Instant.now()
        );
    }

    public static Company rehydrate(CompanyId id,
                                    CompanyName name,
                                    LinkedInUrl linkedinUrl,
                                    String country,
                                    String department,
                                    Instant createdAt) {
        return new Company(id, name, linkedinUrl, country, department, createdAt);
    }

    public CompanyName name() {
        return name;
    }

    public LinkedInUrl linkedinUrl() {
        return linkedinUrl;
    }

    public String country() {
        return country;
    }

    public String department() {
        return department;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public void updateName(CompanyName newName) {
        this.name = newName;
    }
}