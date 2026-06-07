// Supabase Edge Function: zapier-jobs
// Inbound webhook that receives booking inquiries from Zapier and creates them
// as EventDay leads (ef_offers with status = 'lead' — the board's "Leads"
// column, before Kladde/draft).
//
// Auth:   x-zapier-secret header (ZAPIER_WEBHOOK_SECRET env, or the value in
//         public.integration_config key 'zapier_webhook_secret').
// Body:   A single inquiry object, an array, or { jobs: [...] }.
// Per inquiry it:
//   1. resolves/auto-creates the `source` as a lead in ef_leads,
//   2. creates an ef_clients + ef_contacts record (best-effort),
//   3. creates an ef_offers row with status 'lead' linked to the above,
//   4. logs the delivery to public.zapier_webhook_log.
// The EventDay board picks these up (realtime on ef_offers) as new lead cards.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-zapier-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// First non-empty value among the given keys.
function pick(raw: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return null;
}

function coerceInt(v: unknown): number | null {
  if (v == null) return null;
  const n = parseInt(String(v).replace(/[^0-9-]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

// Parse a date into plain wall-clock parts for ef_offers.event_date (date) and
// event_start_time (time). Handles Danish dd/mm/yyyy[ HH:MM] and ISO YYYY-MM-DD.
function parseDateParts(value: unknown): { date: string | null; time: string | null } {
  const s = value == null ? '' : String(value).trim();
  if (!s) return { date: null, time: null };
  const pad = (n: number) => String(n).padStart(2, '0');
  let y = '', mo = '', d = '', hh: string | null = null, mi: string | null = null;

  if (s.length >= 10 && s[4] === '-' && s[7] === '-') {
    // ISO-ish: YYYY-MM-DD[ T HH:MM]
    y = s.slice(0, 4); mo = s.slice(5, 7); d = s.slice(8, 10);
    const t = s.slice(11);
    if (t.length >= 5 && t[2] === ':') { hh = t.slice(0, 2); mi = t.slice(3, 5); }
  } else {
    // Danish/European: dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy [ HH:MM]
    const datePart = s.split(' ')[0].split('T')[0];
    const sep = datePart.includes('/') ? '/' : datePart.includes('.') ? '.' : datePart.includes('-') ? '-' : '';
    if (!sep) return { date: null, time: null };
    const p = datePart.split(sep);
    if (p.length !== 3 || p[2].length !== 4) return { date: null, time: null };
    d = p[0]; mo = p[1]; y = p[2];
    const rest = s.slice(datePart.length).trim();
    if (rest.includes(':')) { const t = rest.split(':'); hh = t[0]; mi = (t[1] || '').slice(0, 2); }
  }

  const yi = +y, moi = +mo, di = +d;
  if (!yi || !moi || !di) return { date: null, time: null };
  const date = `${yi}-${pad(moi)}-${pad(di)}`;
  const time = (hh !== null && mi !== null && Number.isFinite(+hh) && Number.isFinite(+mi))
    ? `${pad(+hh)}:${pad(+mi)}` : null;
  return { date, time };
}

// Unambiguous uppercase code (no 0/O/1/I) for ef_clients.access_code (UNIQUE).
function genCode(len: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

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

// Resolve `source` to a canonical lead in ef_leads (case-insensitive match,
// auto-create if unseen). Returns { id, name } or null. Best-effort.
async function resolveLead(supabase: any, raw: Record<string, unknown>): Promise<{ id: string; name: string } | null> {
  const name = pick(raw, ['source', 'lead_source']);
  if (!name) return null;
  try {
    const { data: existing } = await supabase
      .from('ef_leads').select('id, name').ilike('name', name).limit(1).maybeSingle();
    if (existing?.id) return { id: existing.id, name: existing.name };

    const display = name.charAt(0).toUpperCase() + name.slice(1);
    let website = '';
    const referer = pick(raw, ['referer']);
    if (referer) { try { website = new URL(referer).origin; } catch { /* ignore */ } }
    if (!website && name.includes('.')) website = 'https://' + name.toLowerCase();
    const { data: created } = await supabase
      .from('ef_leads').insert({ name: display, type: 'website', website, active: true })
      .select('id, name').single();
    return created ? { id: created.id, name: created.name } : null;
  } catch (_) {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  const log = async (entry: Record<string, unknown>) => {
    try {
      await supabase.from('zapier_webhook_log').insert({ source: 'zapier', ...entry });
    } catch (_) { /* logging must not break the webhook */ }
  };

  const resolveSecret = async (): Promise<string | null> => {
    const fromEnv = Deno.env.get('ZAPIER_WEBHOOK_SECRET');
    if (fromEnv) return fromEnv;
    try {
      const { data } = await supabase
        .from('integration_config').select('value').eq('key', 'zapier_webhook_secret').maybeSingle();
      return data?.value ?? null;
    } catch (_) { return null; }
  };

  const SECRET = await resolveSecret();
  if (!SECRET) return json({ error: 'Webhook secret not configured' }, 500);
  if (req.headers.get('x-zapier-secret') !== SECRET) {
    await log({ status: 'rejected', event_type: 'lead', error: 'invalid secret' });
    return json({ error: 'Unauthorized' }, 401);
  }

  let payload: unknown;
  try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  let inquiries: Record<string, unknown>[];
  if (Array.isArray(payload)) inquiries = payload as Record<string, unknown>[];
  else if (payload && typeof payload === 'object' && Array.isArray((payload as any).jobs)) inquiries = (payload as any).jobs;
  else if (payload && typeof payload === 'object') inquiries = [payload as Record<string, unknown>];
  else return json({ error: 'Body must be an inquiry object or an array' }, 400);

  const results: Array<Record<string, unknown>> = [];

  for (const raw of inquiries) {
    const lead = await resolveLead(supabase, raw);

    const company = pick(raw, ['company', 'client', 'customer', 'client_name']);
    const contactName = pick(raw, ['contact_name', 'client_contact_name', 'name']);
    const email = pick(raw, ['email', 'contact_email', 'client_contact_email']);
    const phone = pick(raw, ['phone', 'contact_phone', 'client_contact_phone']);
    const guests = coerceInt(pick(raw, ['guests', 'participants', 'guests_count']));
    const location = pick(raw, ['venue', 'location_name', 'city', 'location_city']);
    const activities = pick(raw, ['activities', 'activity']);
    const notes = pick(raw, ['notes', 'note', 'comment']);
    const parts = parseDateParts(pick(raw, ['event_start', 'event_date', 'date', 'start']));

    if (!company && !contactName && !email && !phone) {
      await log({ status: 'rejected', event_type: 'lead', payload: raw, error: 'no usable fields' });
      results.push({ status: 'rejected', reason: 'no usable fields' });
      continue;
    }

    // Best-effort client + contact (the lead still lands if this fails).
    let clientId: string | null = null;
    let contactId: string | null = null;
    try {
      const { data: c, error: ce } = await supabase.from('ef_clients').insert({
        firma: company || contactName || 'Ukendt',
        type: company ? 'virksomhed' : 'privat',
        email, phone,
        access_code: genCode(8),
        note: 'Oprettet automatisk fra ' + (lead?.name ?? 'Zapier-lead'),
      }).select('id').single();
      if (ce) throw ce;
      clientId = c.id;
      const { data: ct } = await supabase.from('ef_contacts').insert({
        client_id: clientId,
        name: contactName || company || 'Ukendt',
        email, phone, is_primary: true,
      }).select('id').single();
      contactId = ct?.id ?? null;
    } catch (_) { /* CRM linking is best-effort */ }

    const who = company || contactName || lead?.name || 'Lead';
    const title = activities ? `${activities} – ${who}` : `Forespørgsel – ${who}`;

    const noteParts: string[] = [];
    if (notes) noteParts.push(notes);
    if (contactName) noteParts.push('Kontakt: ' + contactName);
    if (email) noteParts.push('Email: ' + email);
    if (phone) noteParts.push('Tlf: ' + phone);
    if (lead?.name) noteParts.push('Kilde: ' + lead.name);

    try {
      const { data: o, error } = await supabase.from('ef_offers').insert({
        title,
        status: 'lead',
        participants_count: guests ?? 0,
        event_date: parts.date,
        event_start_time: parts.time,
        event_location: location,
        client_id: clientId,
        contact_id: contactId,
        lead_id: lead?.id ?? null,
        lead_source: lead?.name ?? pick(raw, ['source', 'lead_source']),
        bureau_name: lead?.name ?? null,
        internal_note: noteParts.length ? noteParts.join('\n') : null,
      }).select('id, session_id').single();
      if (error) throw error;
      await log({ status: 'inserted', event_type: 'lead', ef_offer_id: o.id, payload: raw });
      results.push({ status: 'inserted', offer_id: o.id, session_id: o.session_id });
    } catch (err) {
      const message = errMessage(err);
      await log({ status: 'failed', event_type: 'lead', payload: raw, error: message });
      results.push({ status: 'failed', error: message });
    }
  }

  const summary: Record<string, number> = {};
  for (const r of results) {
    const key = String(r.status);
    summary[key] = (summary[key] ?? 0) + 1;
  }
  return json({ ok: true, count: inquiries.length, summary, results });
});
