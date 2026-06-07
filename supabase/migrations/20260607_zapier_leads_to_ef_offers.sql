-- Zapier inbound now creates EventDay "Leads" instead of task_jobs.
-- 1) Allow a new 'lead' status on ef_offers (the board's Leads column, before
--    'draft'/Kladde). Additive change to the existing CHECK constraint.
-- 2) Link webhook deliveries to the created offer.
ALTER TABLE public.ef_offers DROP CONSTRAINT IF EXISTS ef_offers_status_check;
ALTER TABLE public.ef_offers ADD CONSTRAINT ef_offers_status_check
  CHECK (status = ANY (ARRAY['lead','draft','sent','accepted','active','done','completed','rejected','retired']));

ALTER TABLE public.zapier_webhook_log
  ADD COLUMN IF NOT EXISTS ef_offer_id UUID REFERENCES public.ef_offers(id) ON DELETE SET NULL;
