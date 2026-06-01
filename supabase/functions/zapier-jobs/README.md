# Zapier → CCC: Indgående jobs/bookinger

Edge Function `zapier-jobs` modtager job-/booking-data fra Zapier via en webhook
og opretter/opdaterer rækker i `public.task_jobs`.

## Arkitektur

```
Zapier (Webhooks → POST)
        │  JSON body + header: x-zapier-secret
        ▼
Supabase Edge Function: zapier-jobs
        │  validerer secret, mapper felter, type-coercer
        ▼
public.task_jobs   (upsert på opgave_id / short_code)
public.zapier_webhook_log   (logger hver leverance)
        ▼
CCC frontend → "ZAPIER" panel (Opgaver → Admin)
```

## 1. Kør migrationen

```bash
supabase db push
# eller anvend supabase/migrations/20260601_zapier_integration.sql i Supabase Studio
```

Opretter `zapier_webhook_log` + et index på `task_jobs(opgave_id)`.

## 2. Sæt den hemmelige nøgle

To muligheder (env-var har forrang over DB-værdien):

```bash
# A) som function secret (anbefalet i produktion)
supabase secrets set ZAPIER_WEBHOOK_SECRET="<en-lang-tilfældig-streng>"

# B) eller i databasen (kan styres uden redeploy):
#    INSERT INTO public.integration_config (key, value)
#    VALUES ('zapier_webhook_secret', '<streng>')
#    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

`SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` er automatisk tilgængelige i
Edge Functions — dem skal du ikke sætte selv.

## 3. Deploy funktionen

```bash
supabase functions deploy zapier-jobs --no-verify-jwt
```

`--no-verify-jwt` fordi Zapier ikke sender et Supabase-JWT; adgang styres i
stedet af `x-zapier-secret`-headeren.

Endpoint:

```
https://ilbjytyukicbssqftmma.supabase.co/functions/v1/zapier-jobs
```

## 4. Opsæt i Zapier

1. **Action:** *Webhooks by Zapier → POST*
2. **URL:** endpointet ovenfor
3. **Payload Type:** `json`
4. **Headers:**
   - `x-zapier-secret`: samme værdi som `ZAPIER_WEBHOOK_SECRET`
   - `Content-Type`: `application/json`
5. **Data:** map dine felter (se nedenfor)

### Eksempel-body

```json
{
  "external_id": 10432,
  "company": "Novo Nordisk",
  "contact_name": "Mette Hansen",
  "email": "mette@novo.dk",
  "phone": "+45 20 11 22 33",
  "event_start": "2026-08-14T13:00:00+02:00",
  "duration_minutes": 120,
  "guests": 45,
  "venue": "Comwell Kolding",
  "city": "Kolding",
  "activities": ["TeamLazer", "TeamRace"],
  "notes": "Firmaarrangement, ønsker præmieoverrækkelse",
  "privat": false
}
```

Du kan også sende et array eller `{ "jobs": [ ... ] }` for flere på én gang.

## Felt-mapping

Nøgler kan være enten det rigtige `task_jobs`-kolonnenavn eller et alias:

| Kolonne | Aliaser | Type |
|---|---|---|
| `opgave_id` | `external_id`, `booking_id`, `job_id` | tal |
| `client_name` | `company`, `client`, `customer` | tekst |
| `client_contact_name` | `contact_name` | tekst |
| `client_contact_phone` | `contact_phone`, `phone` | tekst |
| `client_contact_email` | `contact_email`, `email` | tekst |
| `event_date` | `event_start`, `start`, `date` | dato/tid |
| `event_end` | `end` | dato/tid |
| `guests_count` | `guests`, `participants` | tal |
| `location_name` | `venue` | tekst |
| `location_address` | `address` | tekst |
| `location_city` | `city` | tekst |
| `activities` | — | liste (array eller komma-separeret) |

Den fulde liste findes i `ALLOWED` / `ALIASES` i `index.ts` og i
`ZAPIER_FIELD_MAP` i `lib/zapier.ts`. Ukendte felter ignoreres (whitelisting).

## Dedupering

- Har payloaden `opgave_id` → matches mod eksisterende job på `opgave_id`.
- Ellers, har den `short_code` → matches på `short_code`.
- Match → **opdatering**, intet match → **ny række**.

## Sikkerhed

- Forkert/manglende `x-zapier-secret` → `401` (logges som `rejected`).
- Funktionen bruger service-role-nøglen og whitelister kolonner, så Zapier
  aldrig kan skrive til vilkårlige felter.
- Hver leverance logges i `zapier_webhook_log` og kan ses i CCC-panelet.

## Test lokalt / med curl

```bash
curl -X POST \
  https://ilbjytyukicbssqftmma.supabase.co/functions/v1/zapier-jobs \
  -H "Content-Type: application/json" \
  -H "x-zapier-secret: <secret>" \
  -d '{"external_id":99999,"company":"Test ApS","guests":20,"event_start":"2026-09-01T10:00:00+02:00"}'
```

Svar:

```json
{ "ok": true, "count": 1, "summary": { "inserted": 1 }, "results": [ { "status": "inserted", "id": "…" } ] }
```
