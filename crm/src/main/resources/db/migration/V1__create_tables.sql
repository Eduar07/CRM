CREATE TABLE IF NOT EXISTS companies (
    id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    linkedin_url VARCHAR(500) NOT NULL,
    country VARCHAR(255) NOT NULL,
    department VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_companies_linkedin_url UNIQUE (linkedin_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    role VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    ms_access_token LONGTEXT NULL,
    ms_refresh_token LONGTEXT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contacts (
    id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_contacts_company_id (company_id),
    CONSTRAINT fk_contacts_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leads (
    id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    contact_id CHAR(36) NOT NULL,
    source VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_leads_company_id (company_id),
    KEY idx_leads_contact_id (contact_id),
    CONSTRAINT fk_leads_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_leads_contact
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_records (
    id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    contact_id CHAR(36) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    status VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_email_records_company_id (company_id),
    KEY idx_email_records_contact_id (contact_id),
    CONSTRAINT fk_email_records_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_email_records_contact
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS meetings (
    id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    contact_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NULL,
    start_time TIMESTAMP(6) NOT NULL,
    end_time TIMESTAMP(6) NOT NULL,
    meeting_link VARCHAR(1000) NULL,
    status VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_meetings_company_id (company_id),
    KEY idx_meetings_contact_id (contact_id),
    KEY idx_meetings_user_id (user_id),
    CONSTRAINT fk_meetings_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_meetings_contact
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_meetings_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
