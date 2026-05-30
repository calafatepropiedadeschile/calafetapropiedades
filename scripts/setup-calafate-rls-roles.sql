-- Calafate Propiedades: roles RLS de runtime (reemplazan nombres legacy dahuss_*).
-- Ejecutar una vez en Supabase → SQL Editor.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'calafate_public_runtime') THEN
    CREATE ROLE calafate_public_runtime NOLOGIN NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'calafate_auth_runtime') THEN
    CREATE ROLE calafate_auth_runtime NOLOGIN NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'calafate_admin_runtime') THEN
    CREATE ROLE calafate_admin_runtime NOLOGIN NOBYPASSRLS;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    GRANT calafate_public_runtime TO postgres;
    GRANT calafate_auth_runtime TO postgres;
    GRANT calafate_admin_runtime TO postgres;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO calafate_public_runtime, calafate_auth_runtime, calafate_admin_runtime;

-- Property / Lead / User
GRANT SELECT ON TABLE public."Property" TO calafate_public_runtime;
GRANT INSERT ON TABLE public."Lead" TO calafate_public_runtime;

GRANT SELECT ("id", "email", "password", "name", "role") ON TABLE public."User" TO calafate_auth_runtime;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Property", public."Lead" TO calafate_admin_runtime;

-- CMS tables (if exist)
GRANT SELECT ON TABLE public."StaticPage" TO calafate_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."StaticPage" TO calafate_admin_runtime;

GRANT SELECT ON TABLE public."HomeHeroSettings" TO calafate_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."HomeHeroSettings" TO calafate_admin_runtime;

GRANT SELECT ON TABLE public."SiteSeoSettings" TO calafate_public_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."SiteSeoSettings" TO calafate_admin_runtime;

-- Policies: Property
DROP POLICY IF EXISTS "public_runtime_read_published_property" ON public."Property";
CREATE POLICY "public_runtime_read_published_property"
  ON public."Property" FOR SELECT TO calafate_public_runtime
  USING ("published" = true);

DROP POLICY IF EXISTS "public_runtime_create_lead" ON public."Lead";
CREATE POLICY "public_runtime_create_lead"
  ON public."Lead" FOR INSERT TO calafate_public_runtime
  WITH CHECK (
    "propertyId" IS NULL
    OR EXISTS (
      SELECT 1 FROM public."Property"
      WHERE public."Property"."id" = "propertyId" AND public."Property"."published" = true
    )
  );

DROP POLICY IF EXISTS "auth_runtime_read_user" ON public."User";
CREATE POLICY "auth_runtime_read_user"
  ON public."User" FOR SELECT TO calafate_auth_runtime USING (true);

DROP POLICY IF EXISTS "admin_runtime_manage_property" ON public."Property";
CREATE POLICY "admin_runtime_manage_property"
  ON public."Property" FOR ALL TO calafate_admin_runtime
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_runtime_manage_lead" ON public."Lead";
CREATE POLICY "admin_runtime_manage_lead"
  ON public."Lead" FOR ALL TO calafate_admin_runtime
  USING (true) WITH CHECK (true);

-- Policies: StaticPage
DROP POLICY IF EXISTS "public_runtime_read_published_static_page" ON public."StaticPage";
CREATE POLICY "public_runtime_read_published_static_page"
  ON public."StaticPage" FOR SELECT TO calafate_public_runtime
  USING ("published" = true);

DROP POLICY IF EXISTS "admin_runtime_manage_static_page" ON public."StaticPage";
CREATE POLICY "admin_runtime_manage_static_page"
  ON public."StaticPage" FOR ALL TO calafate_admin_runtime
  USING (true) WITH CHECK (true);

-- Policies: HomeHeroSettings
DROP POLICY IF EXISTS "public_runtime_read_home_hero_settings" ON public."HomeHeroSettings";
CREATE POLICY "public_runtime_read_home_hero_settings"
  ON public."HomeHeroSettings" FOR SELECT TO calafate_public_runtime USING (true);

DROP POLICY IF EXISTS "admin_runtime_manage_home_hero_settings" ON public."HomeHeroSettings";
CREATE POLICY "admin_runtime_manage_home_hero_settings"
  ON public."HomeHeroSettings" FOR ALL TO calafate_admin_runtime
  USING (true) WITH CHECK (true);

-- Policies: SiteSeoSettings
DROP POLICY IF EXISTS "public_runtime_read_site_seo_settings" ON public."SiteSeoSettings";
CREATE POLICY "public_runtime_read_site_seo_settings"
  ON public."SiteSeoSettings" FOR SELECT TO calafate_public_runtime USING (true);

DROP POLICY IF EXISTS "admin_runtime_manage_site_seo_settings" ON public."SiteSeoSettings";
CREATE POLICY "admin_runtime_manage_site_seo_settings"
  ON public."SiteSeoSettings" FOR ALL TO calafate_admin_runtime
  USING (true) WITH CHECK (true);
