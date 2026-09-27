-- Stamp documents with the embedder that produced their chunk vectors, so the
-- UI can show (and detect staleness after a model switch) which model indexed them.
ALTER TABLE "Document" ADD COLUMN "embeddedWith" TEXT;
