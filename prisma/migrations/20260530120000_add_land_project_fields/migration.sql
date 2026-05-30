-- Adapt Property to Calafate's land-project business model.
-- Existing rows keep working; new fields are nullable unless a safe default exists.

ALTER TABLE "Property"
  ALTER COLUMN "country" SET DEFAULT 'Chile',
  ALTER COLUMN "currency" SET DEFAULT 'CLP',
  ADD COLUMN "mapUrl" TEXT,
  ADD COLUMN "virtualTourUrl" TEXT,
  ADD COLUMN "lotSurfaceM2" DOUBLE PRECISION,
  ADD COLUMN "totalLots" INTEGER,
  ADD COLUMN "availableLots" INTEGER,
  ADD COLUMN "stageName" TEXT,
  ADD COLUMN "paymentTerms" TEXT,
  ADD COLUMN "commissionPercent" DOUBLE PRECISION,
  ADD COLUMN "operationalExpenses" TEXT,
  ADD COLUMN "reservationAmount" DOUBLE PRECISION,
  ADD COLUMN "waterStatus" TEXT,
  ADD COLUMN "electricityStatus" TEXT,
  ADD COLUMN "accessType" TEXT,
  ADD COLUMN "roadType" TEXT,
  ADD COLUMN "hasOwnRol" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "availabilityNotes" TEXT,
  ADD COLUMN "commercialNotes" TEXT,
  ADD COLUMN "distanceHighlights" TEXT NOT NULL DEFAULT '[]';

UPDATE "Property"
SET
  "country" = 'Chile',
  "marketRegion" = 'latam',
  "type" = COALESCE(NULLIF("type", ''), 'terreno'),
  "priceType" = COALESCE(NULLIF("priceType", ''), 'venta')
WHERE "country" IS DISTINCT FROM 'Chile'
   OR "marketRegion" IS DISTINCT FROM 'latam'
   OR "type" IS NULL
   OR "type" = ''
   OR "priceType" IS NULL
   OR "priceType" = '';

CREATE INDEX "Property_published_availableLots_idx" ON "Property"("published", "availableLots");
CREATE INDEX "Property_published_lotSurfaceM2_idx" ON "Property"("published", "lotSurfaceM2");
