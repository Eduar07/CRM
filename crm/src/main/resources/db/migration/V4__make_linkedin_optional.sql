-- Make linkedin_url optional (scraped companies may not have a LinkedIn page)

-- Drop the unique index on linkedin_url if it exists
-- MySQL: find and drop by column name dynamically
SET @idx = (
    SELECT INDEX_NAME FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'companies'
      AND COLUMN_NAME  = 'linkedin_url'
      AND NON_UNIQUE   = 0
    LIMIT 1
);
SET @sql = IF(@idx IS NOT NULL,
    CONCAT('ALTER TABLE companies DROP INDEX `', @idx, '`'),
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Allow NULL values
ALTER TABLE companies
    MODIFY COLUMN linkedin_url VARCHAR(500) NULL;
