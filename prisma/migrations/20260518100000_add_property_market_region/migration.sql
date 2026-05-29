ALTER TABLE "Property"
ADD COLUMN "marketRegion" TEXT NOT NULL DEFAULT 'latam';

UPDATE "Property"
SET "marketRegion" = CASE
  WHEN lower(coalesce("country", '')) IN ('espana', 'españa', 'spain') THEN 'espana_europa'
  WHEN lower(coalesce("country", '')) IN ('mexico', 'méxico') THEN 'mexico'
  WHEN lower(coalesce("country", '')) IN ('estados unidos', 'united states', 'usa', 'eeuu', 'ee.uu.') THEN 'estados_unidos'
  WHEN lower(coalesce("country", '')) IN ('costa rica', 'panama', 'panamá', 'guatemala', 'honduras', 'el salvador', 'nicaragua', 'belice') THEN 'centroamerica'
  ELSE 'latam'
END;

ALTER TABLE "Property"
ALTER COLUMN "country" SET DEFAULT 'Espana';

CREATE INDEX "Property_published_marketRegion_idx" ON "Property"("published", "marketRegion");
CREATE INDEX "Property_published_country_idx" ON "Property"("published", "country");
