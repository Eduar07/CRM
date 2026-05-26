package com.campusland.crm.domain.company;

import com.campusland.crm.domain.shared.AggregateRoot;
import com.campusland.crm.domain.shared.DomainException;

import java.time.Instant;

public class Company extends AggregateRoot<CompanyId> {

    private CompanyName name;
    private LinkedInUrl linkedinUrl;
    private String country;
    private String department;
    private String industry;
    private String size;
    private String website;
    private String assignedTo;
    private String contactStatus;
    private Instant createdAt;
    private String nit;
    private String phones;
    private String emails;
    private String address;
    private String legalRep;
    private String companyState;
    private String description;

    private Company(CompanyId id, CompanyName name, LinkedInUrl linkedinUrl,
                    String country, String department, String industry, String size,
                    String website, String assignedTo, String contactStatus, Instant createdAt,
                    String nit, String phones, String emails, String address,
                    String legalRep, String companyState, String description) {
        super(id);
        this.name = name;
        this.linkedinUrl = linkedinUrl;
        this.country = country;
        this.department = department;
        this.industry = industry;
        this.size = size;
        this.website = website;
        this.assignedTo = assignedTo;
        this.contactStatus = contactStatus != null ? contactStatus : "Nueva";
        this.createdAt = createdAt;
        this.nit = nit;
        this.phones = phones;
        this.emails = emails;
        this.address = address;
        this.legalRep = legalRep;
        this.companyState = companyState;
        this.description = description;
    }

    public static Company create(CompanyName name, LinkedInUrl linkedinUrl,
                                 String country, String department,
                                 String industry, String size, String website, String assignedTo,
                                 String nit, String phones, String emails, String address,
                                 String legalRep, String companyState, String description) {
        if (country == null || country.isBlank()) {
            throw new DomainException("El país es obligatorio");
        }
        return new Company(CompanyId.newId(), name, linkedinUrl, country, department,
                industry, size, website, assignedTo, "Nueva", Instant.now(),
                nit, phones, emails, address, legalRep, companyState, description);
    }

    public static Company rehydrate(CompanyId id, CompanyName name, LinkedInUrl linkedinUrl,
                                    String country, String department, String industry, String size,
                                    String website, String assignedTo, String contactStatus, Instant createdAt,
                                    String nit, String phones, String emails, String address,
                                    String legalRep, String companyState, String description) {
        return new Company(id, name, linkedinUrl, country, department,
                industry, size, website, assignedTo, contactStatus, createdAt,
                nit, phones, emails, address, legalRep, companyState, description);
    }

    public CompanyName name() { return name; }
    public LinkedInUrl linkedinUrl() { return linkedinUrl; }
    public String country() { return country; }
    public String department() { return department; }
    public String industry() { return industry; }
    public String size() { return size; }
    public String website() { return website; }
    public String assignedTo() { return assignedTo; }
    public String contactStatus() { return contactStatus; }
    public Instant createdAt() { return createdAt; }
    public String nit() { return nit; }
    public String phones() { return phones; }
    public String emails() { return emails; }
    public String address() { return address; }
    public String legalRep() { return legalRep; }
    public String companyState() { return companyState; }
    public String description() { return description; }

    public void updateName(CompanyName newName) { this.name = newName; }
    public void updateContactStatus(String status) { this.contactStatus = status; }
    public void updateAssignedTo(String user) { this.assignedTo = user; }
}
