-- Schema completo final (PostgreSQL)
-- V2-V5 son no-ops porque todo está aquí desde el inicio

CREATE TABLE IF NOT EXISTS users (
    id            CHAR(36)     NOT NULL,
    username      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NULL,
    role          VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    ms_access_token TEXT       NULL,
    ms_refresh_token TEXT      NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS companies (
    id            CHAR(36)     NOT NULL,
    name          VARCHAR(255) NOT NULL,
    linkedin_url  VARCHAR(500) NULL,
    country       VARCHAR(255) NOT NULL,
    department    VARCHAR(255) NULL,
    industry      VARCHAR(100) NULL,
    size          VARCHAR(50)  NULL,
    website       VARCHAR(255) NULL,
    assigned_to   VARCHAR(50)  NULL,
    contact_status VARCHAR(50) NOT NULL DEFAULT 'Nueva',
    created_at    TIMESTAMP(6) NOT NULL,
    nit           VARCHAR(30)  NULL,
    phones        VARCHAR(500) NULL,
    emails        VARCHAR(500) NULL,
    address       VARCHAR(500) NULL,
    legal_rep     VARCHAR(255) NULL,
    company_state VARCHAR(100) NULL,
    description   TEXT         NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS contacts (
    id         CHAR(36)     NOT NULL,
    company_id CHAR(36)     NOT NULL,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    role       VARCHAR(255) NOT NULL,
    phone      VARCHAR(50)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_contacts_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts (company_id);

CREATE TABLE IF NOT EXISTS leads (
    id         CHAR(36)     NOT NULL,
    company_id CHAR(36)     NOT NULL,
    contact_id CHAR(36)     NOT NULL,
    source     VARCHAR(255) NOT NULL,
    status     VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_leads_company FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_leads_contact FOREIGN KEY (contact_id) REFERENCES contacts (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads (company_id);
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads (contact_id);

CREATE TABLE IF NOT EXISTS email_records (
    id         CHAR(36)     NOT NULL,
    company_id CHAR(36)     NOT NULL,
    contact_id CHAR(36)     NOT NULL,
    to_email   VARCHAR(255) NOT NULL,
    subject    VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    status     VARCHAR(255) NOT NULL,
    sent_at    TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_email_records_company FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_email_records_contact FOREIGN KEY (contact_id) REFERENCES contacts (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_email_records_company_id ON email_records (company_id);
CREATE INDEX IF NOT EXISTS idx_email_records_contact_id ON email_records (contact_id);

CREATE TABLE IF NOT EXISTS meetings (
    id           CHAR(36)      NOT NULL,
    company_id   CHAR(36)      NOT NULL,
    contact_id   CHAR(36)      NOT NULL,
    user_id      CHAR(36)      NOT NULL,
    title        VARCHAR(255)  NOT NULL,
    description  TEXT          NULL,
    start_time   TIMESTAMP(6)  NOT NULL,
    end_time     TIMESTAMP(6)  NOT NULL,
    meeting_link VARCHAR(1000) NULL,
    status       VARCHAR(255)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_meetings_company FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_meetings_contact FOREIGN KEY (contact_id) REFERENCES contacts (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_meetings_user    FOREIGN KEY (user_id)    REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_meetings_company_id ON meetings (company_id);
CREATE INDEX IF NOT EXISTS idx_meetings_contact_id ON meetings (contact_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id    ON meetings (user_id);

CREATE TABLE IF NOT EXISTS interactions (
    id         CHAR(36)     NOT NULL,
    company_id CHAR(36)     NOT NULL,
    user_id    CHAR(36)     NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    notes      TEXT         NULL,
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_interactions_company FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_interactions_user    FOREIGN KEY (user_id)    REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_interactions_company_id ON interactions (company_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id    ON interactions (user_id);

CREATE TABLE IF NOT EXISTS tasks (
    id          CHAR(36)     NOT NULL,
    user_id     CHAR(36)     NOT NULL,
    company_id  CHAR(36)     NULL,
    description TEXT         NOT NULL,
    due_date    DATE         NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tasks_user    FOREIGN KEY (user_id)    REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_company FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id    ON tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks (company_id);
