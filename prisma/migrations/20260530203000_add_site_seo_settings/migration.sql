CREATE TABLE IF NOT EXISTS public."SiteSeoSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "siteName" TEXT NOT NULL DEFAULT 'Calafate Propiedades',
    "titleTemplate" TEXT NOT NULL DEFAULT '%s | Calafate Propiedades',
    "defaultTitleEs" TEXT NOT NULL DEFAULT 'Calafate Propiedades | Parcelas, terrenos y proyectos en Chile',
    "defaultDescriptionEs" TEXT NOT NULL DEFAULT 'Compra parcelas, terrenos y loteos seleccionados con Calafate Propiedades. Proyectos con informacion clara, tours 360, precios desde y asesoria directa.',
    "defaultTitleEn" TEXT,
    "defaultDescriptionEn" TEXT,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "canonicalBaseUrl" TEXT NOT NULL DEFAULT 'https://calafetapropiedades.vercel.app',
    "defaultOgImage" TEXT,
    "googleSiteVerification" TEXT,
    "googleAnalyticsId" TEXT,
    "metaPixelId" TEXT,
    "allowIndexing" BOOLEAN NOT NULL DEFAULT true,
    "robotsDisallow" TEXT NOT NULL DEFAULT '["/admin/","/api/","/gracias"]',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSeoSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO public."SiteSeoSettings" (
    "id",
    "siteName",
    "titleTemplate",
    "defaultTitleEs",
    "defaultDescriptionEs",
    "keywords",
    "canonicalBaseUrl",
    "robotsDisallow",
    "updatedAt"
)
VALUES (
    'main',
    'Calafate Propiedades',
    '%s | Calafate Propiedades',
    'Calafate Propiedades | Parcelas, terrenos y proyectos en Chile',
    'Compra parcelas, terrenos y loteos seleccionados con Calafate Propiedades. Proyectos con informacion clara, tours 360, precios desde y asesoria directa.',
    '["Calafate Propiedades","parcelas","terrenos","loteos","proyectos inmobiliarios","parcelas en venta","Los Lagos","Los Rios","Maule","topografia"]',
    'https://calafetapropiedades.vercel.app',
    '["/admin/","/api/","/gracias"]',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE public."SiteSeoSettings" ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public."SiteSeoSettings" TO dahuss_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."SiteSeoSettings" TO dahuss_admin_runtime;

DROP POLICY IF EXISTS "public_runtime_read_site_seo_settings" ON public."SiteSeoSettings";
CREATE POLICY "public_runtime_read_site_seo_settings"
  ON public."SiteSeoSettings"
  FOR SELECT
  TO dahuss_public_runtime
  USING (true);

DROP POLICY IF EXISTS "admin_runtime_manage_site_seo_settings" ON public."SiteSeoSettings";
CREATE POLICY "admin_runtime_manage_site_seo_settings"
  ON public."SiteSeoSettings"
  FOR ALL
  TO dahuss_admin_runtime
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."SiteSeoSettings" TO service_role;

    DROP POLICY IF EXISTS "service_role_full_access_site_seo_settings" ON public."SiteSeoSettings";
    CREATE POLICY "service_role_full_access_site_seo_settings"
      ON public."SiteSeoSettings"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
