-- Zapier inbound integration
-- 1) Delivery log for the zapier-jobs Edge Function (observability/debugging)
-- 2) Index to speed up opgave_id-based upsert lookups in task_jobs
-- 3) integration_config: service-role-only key/value store for the webhook
--    secret (env var ZAPIER_WEBHOOK_SECRET takes precedence if set)

CREATE TABLE IF NOT EXISTS public.integration_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- No RLS policies → only the service role (Edge Function) can read/write.
ALTER TABLE public.integration_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.integration_config TO service_role;


CREATE TABLE IF NOT EXISTS public.zapier_webhook_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'zapier',
  event_type TEXT,
  status TEXT NOT NULL,                 -- inserted | updated | failed | rejected
  task_job_id UUID REFERENCES public.task_jobs(id) ON DELETE SET NULL,
  opgave_id INTEGER,
  payload JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zapier_webhook_log_created_at
  ON public.zapier_webhook_log (created_at DESC);

-- Fast lookup for webhook upserts that dedupe on the external booking id
CREATE INDEX IF NOT EXISTS idx_task_jobs_opgave_id
  ON public.task_jobs (opgave_id)
  WHERE deleted_at IS NULL;

-- Row Level Security: only the service role (used by the Edge Function) writes;
-- authenticated crew members may read the log for the admin panel.
ALTER TABLE public.zapier_webhook_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read zapier log" ON public.zapier_webhook_log;
CREATE POLICY "Allow authenticated read zapier log"
  ON public.zapier_webhook_log FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.zapier_webhook_log TO authenticated;
GRANT ALL ON public.zapier_webhook_log TO service_role;
