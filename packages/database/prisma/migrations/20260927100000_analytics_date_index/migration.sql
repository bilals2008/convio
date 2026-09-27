-- Analytics is read by agentId (+ date range), which the existing unique index
-- "Analytics_agentId_date_key" already covers. The standalone agentId index was a
-- redundant prefix copy of it, so drop it and index "date" alone for the
-- date-range-only aggregates (e.g. month-to-date spends grouped by agent).
DROP INDEX IF EXISTS "Analytics_agentId_idx";

CREATE INDEX IF NOT EXISTS "Analytics_date_idx" ON "Analytics"("date");
