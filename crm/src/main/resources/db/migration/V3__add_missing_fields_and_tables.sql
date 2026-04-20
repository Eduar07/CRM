-- V3: Agregar campos faltantes y nuevas tablas
-- Nota: usa procedimientos para verificar columnas antes de agregar (compatible MySQL 8)

-- ── companies: industry ──────────────────────────────────────────────────────
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'industry');
SET @sql := IF(@exist = 0, 'ALTER TABLE companies ADD COLUMN industry VARCHAR(100) NULL AFTER name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── companies: size ───────────────────────────────────────────────────────────
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'size');
SET @sql := IF(@exist = 0, 'ALTER TABLE companies ADD COLUMN size VARCHAR(50) NULL AFTER industry', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── companies: website ────────────────────────────────────────────────────────
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'website');
SET @sql := IF(@exist = 0, 'ALTER TABLE companies ADD COLUMN website VARCHAR(255) NULL AFTER linkedin_url', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── companies: assigned_to ────────────────────────────────────────────────────
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'assigned_to');
SET @sql := IF(@exist = 0, 'ALTER TABLE companies ADD COLUMN assigned_to VARCHAR(50) NULL AFTER department', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── companies: contact_status ─────────────────────────────────────────────────
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'contact_status');
SET @sql := IF(@exist = 0, "ALTER TABLE companies ADD COLUMN contact_status VARCHAR(50) NOT NULL DEFAULT 'Nueva' AFTER assigned_to", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── contacts: phone ───────────────────────────────────────────────────────────
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts' AND COLUMN_NAME = 'phone');
SET @sql := IF(@exist = 0, 'ALTER TABLE contacts ADD COLUMN phone VARCHAR(50) NULL AFTER email', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── interactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interactions (
    id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_interactions_company_id (company_id),
    KEY idx_interactions_user_id (user_id),
    CONSTRAINT fk_interactions_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_interactions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── tasks ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    company_id CHAR(36) NULL,
    description TEXT NOT NULL,
    due_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_tasks_user_id (user_id),
    KEY idx_tasks_company_id (company_id),
    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
