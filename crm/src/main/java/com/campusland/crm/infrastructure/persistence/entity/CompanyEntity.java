package com.campusland.crm.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "companies")
public class CompanyEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "linkedin_url", nullable = false, unique = true, length = 500)
    private String linkedinUrl;

    @Column(nullable = false)
    private String country;

    @Column
    private String department;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CompanyEntity() {
    }

    public CompanyEntity(UUID id, String name, String linkedinUrl, String country, String department, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.linkedinUrl = linkedinUrl;
        this.country = country;
        this.department = department;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public String getCountry() {
        return country;
    }

    public String getDepartment() {
        return department;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}