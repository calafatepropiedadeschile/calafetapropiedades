CREATE TABLE IF NOT EXISTS public."HomeHeroSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "imageUrl" TEXT,
    "titleLine1Es" TEXT,
    "titleLine2Es" TEXT,
    "subtitleEs" TEXT,
    "titleLine1En" TEXT,
    "titleLine2En" TEXT,
    "subtitleEn" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeHeroSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO public."HomeHeroSettings" ("id", "updatedAt")
VALUES ('main', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE public."HomeHeroSettings" ENABLE ROW LEVEL SECURITY;

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

GRANT SELECT ON TABLE public."HomeHeroSettings" TO dahuss_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."HomeHeroSettings" TO dahuss_admin_runtime;

DROP POLICY IF EXISTS "public_runtime_read_home_hero_settings" ON public."HomeHeroSettings";
CREATE POLICY "public_runtime_read_home_hero_settings"
  ON public."HomeHeroSettings"
  FOR SELECT
  TO dahuss_public_runtime
  USING (true);

DROP POLICY IF EXISTS "admin_runtime_manage_home_hero_settings" ON public."HomeHeroSettings";
CREATE POLICY "admin_runtime_manage_home_hero_settings"
  ON public."HomeHeroSettings"
  FOR ALL
  TO dahuss_admin_runtime
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."HomeHeroSettings" TO service_role;

    DROP POLICY IF EXISTS "service_role_full_access_home_hero_settings" ON public."HomeHeroSettings";
    CREATE POLICY "service_role_full_access_home_hero_settings"
      ON public."HomeHeroSettings"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
