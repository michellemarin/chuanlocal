ALTER TABLE shops ADD COLUMN updated_at TEXT;
UPDATE shops SET updated_at = created_at;
