package com.campusland.crm.domain.company;

public record LinkedInUrl(String value) {
    public LinkedInUrl {
        // LinkedIn URL is optional for scraped companies
        if (value == null || value.isBlank()) {
            value = null;
        } else {
            value = value.trim();
            if (!value.startsWith("http://") && !value.startsWith("https://")) {
                value = "https://" + value;
            }
        }
    }
}
