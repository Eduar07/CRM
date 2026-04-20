package com.campusland.crm.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "companies")
public class CompanyEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column
    private String industry;

    @Column
    private String size;

    @Column(name = "linkedin_url", nullable = false, unique = true, length = 500)
    private String linkedinUrl;

    @Column
    private String website;

    @Column(nullable = false)
    private String country;

    @Column
    private String department;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "contact_status", nullable = false)
    private String contactStatus = "Nueva";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CompanyEntity() {}

    public CompanyEntity(UUID id, String name, String industry, String size,
                         String linkedinUrl, String website, String country,
                         String department, String assignedTo, String contactStatus,
                         Instant createdAt) {
        this.id = id;
        this.name = name;
        this.industry = industry;
        this.size = size;
        this.linkedinUrl = linkedinUrl;
        this.website = website;
        this.country = country;
        this.department = department;
        this.assignedTo = assignedTo;
        this.contactStatus = contactStatus != null ? contactStatus : "Nueva";
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getIndustry() { return industry; }
    public String getSize() { return size; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getWebsite() { return website; }
    public String getCountry() { return country; }
    public String getDepartment() { return department; }
    public String getAssignedTo() { return assignedTo; }
    public String getContactStatus() { return contactStatus; }
    public Instant getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setIndustry(String industry) { this.industry = industry; }
    public void setSize(String size) { this.size = size; }
    public void setWebsite(String website) { this.website = website; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public void setContactStatus(String contactStatus) { this.contactStatus = contactStatus; }
}
