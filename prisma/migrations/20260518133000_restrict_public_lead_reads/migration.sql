DROP POLICY IF EXISTS "public_runtime_read_created_lead_id" ON public."Lead";

REVOKE SELECT ("id") ON TABLE public."Lead" FROM dahuss_public_runtime;
REVOKE SELECT ON TABLE public."Lead" FROM dahuss_public_runtime;
