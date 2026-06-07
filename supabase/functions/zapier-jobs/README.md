# Zapier → EventDay Leads

Edge Function `zapier-jobs` receives booking inquiries from Zapier and creates
them as **EventDay leads** in Supabase (`ef_offers` with `status = 'lead'` — the
board's "Leads" column, before Kladde/draft).

## Flow

```
Zapier (Webhooks → POST, header: x-zapier-secret)
        │  JSON inquiry (company, contact, email, date, guests, source, ...)
        ▼
Edge Function: zapier-jobs   (validates secret → builds CRM records)
        ▼
public.ef_leads     ← source auto-registered (e.g. "Evento.dk")
public.ef_clients   ← firma + type (virksomhed/privat) + access_code
public.ef_contacts  ← primary contact
public.ef_offers    ← status='lead', linked to all of the above, auto session_id
public.zapier_webhook_log ← one row per delivery (ef_offer_id, status, payload)
        ▼
EventDay board (separate repo) → "Leads" column (realtime). See EVENTDAY_LEADS_UI.md
```

## Setup (already deployed to project `ilbjytyukicbssqftmma`)

1. **Migrations** (`supabase db push`): `zapier_webhook_log`, `integration_config`,
   the `'lead'` status on `ef_offers`, and `zapier_webhook_log.ef_offer_id`.
2. **Secret** — env `ZAPIER_WEBHOOK_SECRET`, or row in `integration_config`
   (`key='zapier_webhook_secret'`). Env takes precedence.
3. **Deploy**: `supabase functions deploy zapier-jobs --no-verify-jwt`
   (auth is the `x-zapier-secret` header, not a Supabase JWT).

Endpoint: `https://ilbjytyukicbssqftmma.supabase.co/functions/v1/zapier-jobs`

## Zapier setup

*Webhooks by Zapier → POST*, Payload Type `json`, header
`x-zapier-secret: <secret>`. Map the inquiry fields (key → trigger value):

| Key | Aliases | Becomes |
|---|---|---|
| `company` | client, customer | ef_clients.firma (virksomhed); tomt = privat |
| `contact_name` | name | ef_contacts.name |
| `email` | contact_email | client + contact |
| `phone` | contact_phone | client + contact |
| `event_start` | event_date, date, start | ef_offers.event_date + event_start_time |
| `guests` | participants | ef_offers.participants_count |
| `venue` | city | ef_offers.event_location |
| `activities` | activity | ef_offers.title |
| `notes` | note, comment | ef_offers.internal_note |
| `source` | lead_source | ef_leads (auto-created) + lead_source/bureau_name |
| `referer` | | website for a new lead source |

**Do not map a booking id** — leads have no external id; each inquiry is a fresh
lead with its own `session_id` (mapping a static id caused unique-collision
failures on the old task_jobs target).

Dates: Danish `dd/mm/åååå[ HH:MM]` is read as wall-clock (e.g. `07/06/2026 12:00`
→ event_date 2026-06-07, time 12:00); ISO `YYYY-MM-DD` also works.

## Test (curl)

```bash
curl -X POST https://ilbjytyukicbssqftmma.supabase.co/functions/v1/zapier-jobs \
  -H "Content-Type: application/json" -H "x-zapier-secret: <secret>" \
  -d '{"company":"Test ApS","contact_name":"Test","email":"t@evento.dk","guests":"20","event_start":"01/09/2026 10:00","source":"evento.dk"}'
# → {"ok":true,"summary":{"inserted":1},"results":[{"status":"inserted","offer_id":"…","session_id":"…"}]}
```
