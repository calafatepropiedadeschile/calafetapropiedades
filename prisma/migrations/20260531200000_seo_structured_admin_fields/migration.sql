-- Regiones para JSON-LD areaServed (RealEstateAgent)
ALTER TABLE "SiteSeoSettings"
ADD COLUMN IF NOT EXISTS "serviceAreas" TEXT NOT NULL DEFAULT '["Los Lagos","Los Ríos","Maule"]';

-- Dirección estructurada para JSON-LD (oficina)
ALTER TABLE "SiteSettings"
ADD COLUMN IF NOT EXISTS "officeStreetAddress" TEXT,
ADD COLUMN IF NOT EXISTS "officeLocality" TEXT,
ADD COLUMN IF NOT EXISTS "officeRegion" TEXT;

UPDATE "SiteSeoSettings"
SET "serviceAreas" = '["Los Lagos","Los Ríos","Maule"]'
WHERE "serviceAreas" IS NULL OR trim("serviceAreas") = '';
