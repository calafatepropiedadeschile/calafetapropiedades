ALTER TABLE public."Property"
ADD COLUMN IF NOT EXISTS "seoTitleEs" TEXT,
ADD COLUMN IF NOT EXISTS "seoTitleEn" TEXT,
ADD COLUMN IF NOT EXISTS "seoDescriptionEs" TEXT,
ADD COLUMN IF NOT EXISTS "seoDescriptionEn" TEXT,
ADD COLUMN IF NOT EXISTS "customCanonical" TEXT,
ADD COLUMN IF NOT EXISTS "ogImage" TEXT;

CREATE TABLE IF NOT EXISTS public."StaticPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEs" TEXT NOT NULL,
    "titleEn" TEXT,
    "contentEs" TEXT NOT NULL,
    "contentEn" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "seoTitleEs" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionEs" TEXT,
    "seoDescriptionEn" TEXT,
    "customCanonical" TEXT,
    "ogImage" TEXT,

    CONSTRAINT "StaticPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StaticPage_slug_key" ON public."StaticPage"("slug");
CREATE INDEX IF NOT EXISTS "StaticPage_published_createdAt_idx" ON public."StaticPage"("published", "createdAt");

ALTER TABLE public."StaticPage" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dahuss_public_runtime') THEN
    CREATE ROLE dahuss_public_runtime NOLOGIN NOBYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dahuss_admin_runtime') THEN
    CREATE ROLE dahuss_admin_runtime NOLOGIN NOBYPASSRLS;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    GRANT dahuss_public_runtime TO postgres;
    GRANT dahuss_admin_runtime TO postgres;
  END IF;
END $$;

GRANT SELECT ON TABLE public."StaticPage" TO dahuss_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."StaticPage" TO dahuss_admin_runtime;

DROP POLICY IF EXISTS "public_runtime_read_published_static_page" ON public."StaticPage";
CREATE POLICY "public_runtime_read_published_static_page"
  ON public."StaticPage"
  FOR SELECT
  TO dahuss_public_runtime
  USING ("published" = true);

DROP POLICY IF EXISTS "admin_runtime_manage_static_page" ON public."StaticPage";
CREATE POLICY "admin_runtime_manage_static_page"
  ON public."StaticPage"
  FOR ALL
  TO dahuss_admin_runtime
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."StaticPage" TO service_role;

    DROP POLICY IF EXISTS "service_role_full_access_static_page" ON public."StaticPage";
    CREATE POLICY "service_role_full_access_static_page"
      ON public."StaticPage"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
