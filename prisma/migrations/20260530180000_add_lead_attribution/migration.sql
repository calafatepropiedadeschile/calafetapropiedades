ALTER TABLE public."Lead"
ADD COLUMN IF NOT EXISTS "leadSource" TEXT NOT NULL DEFAULT 'web_form',
ADD COLUMN IF NOT EXISTS "landingPath" TEXT,
ADD COLUMN IF NOT EXISTS "referrer" TEXT,
ADD COLUMN IF NOT EXISTS "utmSource" TEXT,
ADD COLUMN IF NOT EXISTS "utmMedium" TEXT,
ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT,
ADD COLUMN IF NOT EXISTS "utmContent" TEXT,
ADD COLUMN IF NOT EXISTS "utmTerm" TEXT;

CREATE INDEX IF NOT EXISTS "Lead_utmCampaign_createdAt_idx"
ON public."Lead"("utmCampaign", "createdAt");
