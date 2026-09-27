-- AlterTable
ALTER TABLE "Message" ADD COLUMN "agentId" TEXT;

-- Backfill from Conversation
UPDATE "Message" m
SET "agentId" = c."agentId"
FROM "Conversation" c
WHERE m."conversationId" = c."id";

-- Set NOT NULL after backfill
ALTER TABLE "Message" ALTER COLUMN "agentId" SET NOT NULL;

-- Foreign key backing the Message.agent relation (and its cascade delete).
ALTER TABLE "Message" ADD CONSTRAINT "Message_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Message_agentId_createdAt_idx" ON "Message"("agentId", "createdAt");
