-- Corrige typo calafetapropiedades -> calafatepropiedades en URLs canónicas.

UPDATE "SiteSeoSettings"
SET "canonicalBaseUrl" = REPLACE("canonicalBaseUrl", 'calafetapropiedades', 'calafatepropiedades')
WHERE "canonicalBaseUrl" LIKE '%calafetapropiedades%';

UPDATE "Property"
SET "customCanonical" = REPLACE("customCanonical", 'calafetapropiedades', 'calafatepropiedades')
WHERE "customCanonical" IS NOT NULL
  AND "customCanonical" LIKE '%calafetapropiedades%';

UPDATE "StaticPage"
SET "customCanonical" = REPLACE("customCanonical", 'calafetapropiedades', 'calafatepropiedades')
WHERE "customCanonical" IS NOT NULL
  AND "customCanonical" LIKE '%calafetapropiedades%';

ALTER TABLE "SiteSeoSettings"
  ALTER COLUMN "canonicalBaseUrl" SET DEFAULT 'https://calafatepropiedades.vercel.app';
