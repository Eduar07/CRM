-- Add extra fields captured during web scraping
ALTER TABLE companies
    ADD COLUMN nit           VARCHAR(30)  NULL,
    ADD COLUMN phones        VARCHAR(500) NULL,
    ADD COLUMN emails        VARCHAR(500) NULL,
    ADD COLUMN address       VARCHAR(500) NULL,
    ADD COLUMN legal_rep     VARCHAR(255) NULL,
    ADD COLUMN company_state VARCHAR(100) NULL,
    ADD COLUMN description   TEXT         NULL;
