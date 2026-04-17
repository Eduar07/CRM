CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    linkedin_url VARCHAR(500) NOT NULL UNIQUE,
    country VARCHAR(120) NOT NULL,
    department VARCHAR(120),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    CONSTRAINT fk_contacts_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE leads (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    contact_id UUID NOT NULL,
    source VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_leads_company
        FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_leads_contact
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE email_records (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    contact_id UUID NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_emails_company
        FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_emails_contact
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE meetings (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    contact_id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    meeting_link VARCHAR(1000),
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_meetings_company
        FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_meetings_contact
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    ms_access_token TEXT,
    ms_refresh_token TEXT
);

CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_contact_id ON leads(contact_id);
CREATE INDEX idx_emails_company_id ON email_records(company_id);
CREATE INDEX idx_emails_contact_id ON email_records(contact_id);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);

ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255);

ALTER TABLE users
ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;