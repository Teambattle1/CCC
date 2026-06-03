// Supabase Edge Function: zapier-jobs
// Inbound webhook that receives job/booking data from Zapier and upserts it
// into the public.task_jobs table.
//
// Auth:   Zapier must send the shared secret in the `x-zapier-secret` header.
//         The secret is read from the ZAPIER_WEBHOOK_SECRET function secret if
//         set, otherwise from public.integration_config (key
//         'zapier_webhook_secret').
// Body:   A single job object, an array of jobs, or { jobs: [...] }.
//         Keys may use task_jobs column names directly or the friendly aliases
//         defined in ALIASES below.
// Dedupe: Jobs are matched on `opgave_id` (preferred) or `short_code`. A match
//         updates the existing row, otherwise a new row is inserted.
//
// Every delivery is logged to public.zapier_webhook_log for observability.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-zapier-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Allowed task_jobs columns + their coercion type ────────────────
type Coerce = 'text' | 'int' | 'numeric' | 'bool' | 'timestamptz' | 'text[]' | 'jsonb';

// Parse a date value to an ISO timestamp. Danish/European wall-clock formats
// like "07/06/2026 12:00" (dd/mm/yyyy) are interpreted as Europe/Copenhagen
// time (DST-aware); anything else (e.g. ISO-8601 with an offset) is parsed
// natively so its explicit timezone is respected.
function parseDate(value: unknown): string | null {
  const s = String(value).trim();
  const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) {
    const day = +m[1], month = +m[2], year = +m[3], hour = +(m[4] ?? 0), min = +(m[5] ?? 0);
    // Treat the wall-clock as Europe/Copenhagen and convert to the UTC instant.
    const wallAsUtc = Date.UTC(year, month - 1, day, hour, min);
    const shownInCph = new Date(wallAsUtc).toLocaleString('en-US', { timeZone: 'Europe/Copenhagen' });
    const offset = new Date(shownInCph).getTime() - wallAsUtc;
    const real = new Date(wallAsUtc - offset);
    return isNaN(real.getTime()) ? null : real.toISOString();
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

const ALLOWED: Record<string, Coerce> = {
  // Client
  client_name: 'text',
  client_contact_name: 'text',
  client_contact_phone: 'text',
  client_contact_email: 'text',
  client_logo_url: 'text',
  client_website: 'text',
  agency: 'text',
  customer_number: 'text',
  customer_type: 'text',
  language: 'text',
  firma_info: 'text',
  // Event
  event_date: 'timestamptz',
  event_end: 'timestamptz',
  event_time: 'text',
  duration_minutes: 'int',
  guests_count: 'int',
  instructors_count: 'int',
  assistants_count: 'int',
  activities: 'text[]',
  activity_counts: 'jsonb',
  activity_sessions: 'jsonb',
  activity_pricing: 'jsonb',
  // Location
  location_name: 'text',
  location_address: 'text',
  location_city: 'text',
  location_region: 'text',
  location_id: 'text',
  get_in_location: 'text',
  get_in_time_storage: 'timestamptz',
  get_in_time_location: 'timestamptz',
  get_back_location: 'text',
  post_session_destination: 'text',
  // Notes
  notes: 'text',
  task_notes: 'text',
  timing_note: 'text',
  crew_note: 'text',
  aktiviteter_note: 'text',
  gear_note: 'text',
  transport_note: 'text',
  teamsize_note: 'text',
  team_info_text: 'text',
  // Flags
  kun_tilbud: 'bool',
  privat: 'bool',
  skal_evalueres: 'bool',
  drikkevarer: 'bool',
  cafeborde: 'bool',
  winner_ceremony: 'bool',
  bil_tankes: 'bool',
  bil_oplades: 'bool',
  // Payment
  payment_method: 'text',
  payment_amount: 'numeric',
  payment_card_fee: 'numeric',
  payment_contact: 'text',
  // Status / identity
  status: 'text',
  opgave_status: 'text',
  opgave_id: 'int',
  short_code: 'text',
  logistics: 'jsonb',
};

// Friendly aliases → canonical column names (so Zapier field names can be loose)
const ALIASES: Record<string, string> = {
  external_id: 'opgave_id',
  booking_id: 'opgave_id',
  job_id: 'opgave_id',
  company: 'client_name',
  client: 'client_name',
  customer: 'client_name',
  contact_name: 'client_contact_name',
  contact_phone: 'client_contact_phone',
  phone: 'client_contact_phone',
  contact_email: 'client_contact_email',
  email: 'client_contact_email',
  event_start: 'event_date',
  start: 'event_date',
  date: 'event_date',
  end: 'event_end',
  guests: 'guests_count',
  participants: 'guests_count',
  city: 'location_city',
  address: 'location_address',
  venue: 'location_name',
};

// ── Type coercion ──────────────────────────────────────────────────
function coerce(type: Coerce, value: unknown): unknown {
  if (value === null || value === undefined || value === '') return null;
  switch (type) {
    case 'text':
      return String(value);
    case 'int': {
      const n = parseInt(String(value).replace(/[^\d-]/g, ''), 10);
      return Number.isFinite(n) ? n : null;
    }
    case 'numeric': {
      const n = parseFloat(String(value).replace(',', '.').replace(/[^\d.-]/g, ''));
      return Number.isFinite(n) ? n : null;
    }
    case 'bool': {
      if (typeof value === 'boolean') return value;
      const s = String(value).trim().toLowerCase();
      return ['true', '1', 'yes', 'ja', 'on'].includes(s);
    }
    case 'timestamptz':
      return parseDate(value);
    case 'text[]': {
      if (Array.isArray(value)) return value.map(String);
      return String(value)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    case 'jsonb':
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      }
      return value;
  }
}

// Extract a readable message from a thrown error or a Supabase/Postgrest error
// object (which is a plain object with message/details/hint/code, not an Error).
function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    return [e.message, e.details, e.hint, e.code ? `[${e.code}]` : null]
      .filter(Boolean)
      .join(' | ') || JSON.stringify(err);
  }
  return String(err);
}

// Map a raw incoming object → a clean, type-coerced task_jobs row
function mapJob(raw: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(raw)) {
    const col = ALLOWED[key] ? key : ALIASES[key];
    if (!col || !ALLOWED[col]) continue;
    const coerced = coerce(ALLOWED[col], val);
    if (coerced !== null) row[col] = coerced;
  }
  return row;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // Best-effort delivery logger (never throws)
  const log = async (entry: Record<string, unknown>) => {
    try {
      await supabase.from('zapier_webhook_log').insert({ source: 'zapier', ...entry });
    } catch (_) {
      /* logging must not break the webhook */
    }
  };

  // Resolve the shared secret. Env var takes precedence; otherwise fall back to
  // the integration_config table (so the secret can be managed without
  // redeploying the function).
  const resolveSecret = async (): Promise<string | null> => {
    const fromEnv = Deno.env.get('ZAPIER_WEBHOOK_SECRET');
    if (fromEnv) return fromEnv;
    try {
      const { data } = await supabase
        .from('integration_config')
        .select('value')
        .eq('key', 'zapier_webhook_secret')
        .maybeSingle();
      return data?.value ?? null;
    } catch (_) {
      return null;
    }
  };

  // ── Auth ──
  const SECRET = await resolveSecret();
  if (!SECRET) {
    return json({ error: 'Webhook secret not configured' }, 500);
  }
  const provided = req.headers.get('x-zapier-secret');
  if (provided !== SECRET) {
    await log({ status: 'rejected', event_type: 'jobs', error: 'invalid secret' });
    return json({ error: 'Unauthorized' }, 401);
  }

  // ── Parse ──
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  let jobs: Record<string, unknown>[];
  if (Array.isArray(payload)) {
    jobs = payload as Record<string, unknown>[];
  } else if (payload && typeof payload === 'object' && Array.isArray((payload as any).jobs)) {
    jobs = (payload as any).jobs;
  } else if (payload && typeof payload === 'object') {
    jobs = [payload as Record<string, unknown>];
  } else {
    return json({ error: 'Body must be a job object or an array of jobs' }, 400);
  }

  const results: Array<Record<string, unknown>> = [];

  for (const raw of jobs) {
    const row = mapJob(raw);

    if (Object.keys(row).length === 0) {
      await log({ status: 'rejected', event_type: 'jobs', payload: raw, error: 'no mappable fields' });
      results.push({ status: 'rejected', reason: 'no mappable fields' });
      continue;
    }

    // Determine dedupe key: opgave_id preferred, else short_code
    let existingId: string | null = null;
    try {
      if (row.opgave_id != null) {
        const { data } = await supabase
          .from('task_jobs')
          .select('id')
          .eq('opgave_id', row.opgave_id)
          .is('deleted_at', null)
          .limit(1)
          .maybeSingle();
        existingId = data?.id ?? null;
      } else if (row.short_code) {
        const { data } = await supabase
          .from('task_jobs')
          .select('id')
          .eq('short_code', row.short_code)
          .is('deleted_at', null)
          .limit(1)
          .maybeSingle();
        existingId = data?.id ?? null;
      }
    } catch (_) {
      /* fall through to insert */
    }

    try {
      if (existingId) {
        row.updated_at = new Date().toISOString();
        const { error } = await supabase.from('task_jobs').update(row).eq('id', existingId);
        if (error) throw error;
        await log({
          status: 'updated',
          event_type: 'jobs',
          task_job_id: existingId,
          opgave_id: row.opgave_id ?? null,
          payload: raw,
        });
        results.push({ status: 'updated', id: existingId });
      } else {
        const { data, error } = await supabase
          .from('task_jobs')
          .insert(row)
          .select('id')
          .single();
        if (error) throw error;
        await log({
          status: 'inserted',
          event_type: 'jobs',
          task_job_id: data.id,
          opgave_id: row.opgave_id ?? null,
          payload: raw,
        });
        results.push({ status: 'inserted', id: data.id });
      }
    } catch (err) {
      const message = errMessage(err);
      await log({
        status: 'failed',
        event_type: 'jobs',
        opgave_id: row.opgave_id ?? null,
        payload: raw,
        error: message,
      });
      results.push({ status: 'failed', error: message });
    }
  }

  const summary: Record<string, number> = {};
  for (const r of results) {
    const key = String(r.status);
    summary[key] = (summary[key] ?? 0) + 1;
  }

  return json({ ok: true, count: jobs.length, summary, results });
});
