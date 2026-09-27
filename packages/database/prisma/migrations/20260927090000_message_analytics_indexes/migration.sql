-- Composite index matching the analytics filter:
-- WHERE agentId = ... AND role = 'assistant' AND createdAt BETWEEN ...
--
-- Plain build, not CONCURRENTLY: Prisma wraps every migration in a transaction
-- and PostgreSQL forbids CREATE INDEX CONCURRENTLY there. If "Message" is ever
-- large enough that the build lock matters, create this index manually outside
-- a migration instead.
CREATE INDEX IF NOT EXISTS "Message_agentId_role_createdAt_idx"
  ON "Message"("agentId", "role", "createdAt");

-- Refresh planner statistics so the new indexes are actually used.
ANALYZE "Message";
ANALYZE "Conversation";
