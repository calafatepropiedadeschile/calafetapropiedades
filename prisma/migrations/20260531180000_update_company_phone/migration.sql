-- Actualiza teléfono corporativo si aún tiene el número anterior en SiteSettings.
UPDATE "SiteSettings"
SET
  "primaryPhone" = '+56 9 3540 6356',
  "whatsappNumber" = '56935406356',
  "updatedAt" = NOW()
WHERE "id" = 'main'
  AND (
    "primaryPhone" IS NULL
    OR "primaryPhone" IN ('+56 9 9541 7524', '56995417524', '+56995417524')
    OR "whatsappNumber" IS NULL
    OR "whatsappNumber" IN ('56995417524', '+56995417524')
  );
