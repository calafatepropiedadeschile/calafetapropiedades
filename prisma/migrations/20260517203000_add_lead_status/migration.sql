ALTER TABLE "Lead"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pendiente';

CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
