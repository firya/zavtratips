-- This is an empty migration.

-- Alter collation for Recommendation.name to support case-insensitive Cyrillic search
ALTER TABLE "Recommendation" ALTER COLUMN "name" TYPE TEXT COLLATE "und-x-icu";