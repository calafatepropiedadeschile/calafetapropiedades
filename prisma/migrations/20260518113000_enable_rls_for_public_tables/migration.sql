ALTER TABLE public."Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE public."Property", public."Lead", public."User" FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE public."Property", public."Lead", public."User" FROM authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Property", public."Lead", public."User" TO service_role;
    EXECUTE 'CREATE POLICY "service_role_full_access_property" ON public."Property" FOR ALL TO service_role USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "service_role_full_access_lead" ON public."Lead" FOR ALL TO service_role USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "service_role_full_access_user" ON public."User" FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;
