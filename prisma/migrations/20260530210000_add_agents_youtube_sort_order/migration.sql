-- CreateTable
CREATE TABLE IF NOT EXISTS "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "agentId" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Property_agentId_fkey'
  ) THEN
    ALTER TABLE "Property"
    ADD CONSTRAINT "Property_agentId_fkey"
    FOREIGN KEY ("agentId") REFERENCES "Agent"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Property_published_sortOrder_createdAt_idx"
ON "Property"("published", "sortOrder", "createdAt");

-- RLS: Agent (calafate_* roles)
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public."Agent" TO calafate_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Agent" TO calafate_admin_runtime;

DROP POLICY IF EXISTS "public_runtime_read_agent" ON public."Agent";
CREATE POLICY "public_runtime_read_agent"
  ON public."Agent" FOR SELECT TO calafate_public_runtime
  USING (true);

DROP POLICY IF EXISTS "admin_runtime_manage_agent" ON public."Agent";
CREATE POLICY "admin_runtime_manage_agent"
  ON public."Agent" FOR ALL TO calafate_admin_runtime
  USING (true) WITH CHECK (true);
