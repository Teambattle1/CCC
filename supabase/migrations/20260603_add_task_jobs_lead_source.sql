-- Store which lead/source a job came from (e.g. "Evento.dk", "Polterabend.dk").
-- Populated by the zapier-jobs webhook from the incoming `source` field, which
-- is also auto-registered in public.ef_leads.
ALTER TABLE public.task_jobs ADD COLUMN IF NOT EXISTS lead_source TEXT;
