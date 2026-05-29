ALTER TABLE "Property"
RENAME COLUMN "title" TO "titleEs";

ALTER TABLE "Property"
RENAME COLUMN "description" TO "descriptionEs";

ALTER TABLE "Property"
RENAME COLUMN "zone" TO "zoneEs";

ALTER TABLE "Property"
RENAME COLUMN "city" TO "cityEs";

ALTER TABLE "Property"
ADD COLUMN "titleEn" TEXT,
ADD COLUMN "descriptionEn" TEXT,
ADD COLUMN "zoneEn" TEXT,
ADD COLUMN "cityEn" TEXT;

DROP INDEX IF EXISTS "Property_published_zone_idx";

CREATE INDEX "Property_published_zoneEs_idx" ON "Property"("published", "zoneEs");
