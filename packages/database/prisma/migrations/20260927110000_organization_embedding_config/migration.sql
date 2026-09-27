-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "embeddingProvider" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "Organization" ADD COLUMN "embeddingModel" TEXT;
