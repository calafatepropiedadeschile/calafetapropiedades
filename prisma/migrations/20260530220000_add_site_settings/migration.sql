-- CreateTable
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "primaryPhone" TEXT,
    "primaryEmail" TEXT,
    "officeAddress" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "linkedinUrl" TEXT,
    "discoverImageUrl" TEXT,
    "discoverEyebrow" TEXT,
    "discoverTitle" TEXT,
    "discoverParagraph1" TEXT,
    "discoverParagraph2" TEXT,
    "discoverEyebrowEn" TEXT,
    "discoverTitleEn" TEXT,
    "discoverParagraph1En" TEXT,
    "discoverParagraph2En" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- RLS: SiteSettings
ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public."SiteSettings" TO calafate_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."SiteSettings" TO calafate_admin_runtime;

DROP POLICY IF EXISTS "public_runtime_read_site_settings" ON public."SiteSettings";
CREATE POLICY "public_runtime_read_site_settings"
  ON public."SiteSettings" FOR SELECT TO calafate_public_runtime
  USING (true);

DROP POLICY IF EXISTS "admin_runtime_manage_site_settings" ON public."SiteSettings";
CREATE POLICY "admin_runtime_manage_site_settings"
  ON public."SiteSettings" FOR ALL TO calafate_admin_runtime
  USING (true) WITH CHECK (true);
