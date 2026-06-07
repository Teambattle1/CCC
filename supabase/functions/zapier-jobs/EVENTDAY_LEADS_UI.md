# EventDay "Leads" column — frontend spec

The `zapier-jobs` Edge Function now creates incoming inquiries as **leads** in
the shared Supabase DB. This spec describes the UI work needed in the **eventday**
repo to surface them on the offers board. (No backend work needed — that's done.)

## What the backend already does

For every Zapier inquiry the function creates:

- `ef_offers` row with **`status = 'lead'`** (a new allowed status), with
  `title`, `event_date`, `event_start_time`, `event_location`,
  `participants_count`, `lead_source`, `bureau_name`, `internal_note`, and a
  `session_id` (auto-generated like all offers).
- `ef_clients` + `ef_contacts` (linked via `client_id` / `contact_id`).
- `ef_leads` entry for the source (e.g. "Evento.dk"), linked via `lead_id`.

The `status` CHECK constraint now allows:
`lead, draft, sent, accepted, active, done, completed, rejected, retired`.

## Frontend tasks (eventday repo)

### 1. New "Leads" column
Add a board column for `status = 'lead'`, positioned **before "Kladde"** (draft).
Reuse the existing offer-card component — lead offers have all the same fields
(title, session_id, event_date, participants_count, client). Show `lead_source`
as a small badge on the card (e.g. "Evento.dk").

### 2. Realtime + notification
Subscribe to inserts so new leads appear live and trigger a notification:

```ts
const channel = supabase
  .channel('ef_offers_leads')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'ef_offers', filter: 'status=eq.lead' },
    (payload) => {
      addLeadCard(payload.new);          // prepend to Leads column
      notify(`Nyt lead: ${payload.new.title}`); // toast / badge / sound
    },
  )
  .subscribe();
// remember to supabase.removeChannel(channel) on unmount
```

> Realtime must be enabled for `public.ef_offers` (Supabase → Database →
> Replication). If it isn't, enable it or fall back to polling
> `select ... where status='lead'`.

### 3. Red glowing border until triaged
Mark fresh leads visually until they're moved into Kladde. Two options:

- **Simple (client-side):** any card with `status='lead'` gets the glow.
- **Precise (seen/unseen):** add a `lead_seen boolean default false` column to
  `ef_offers`; glow while `!lead_seen`; set it true when the card is opened.

```css
.lead-card-new {
  border: 2px solid #ef4444;
  box-shadow: 0 0 0 1px #ef4444, 0 0 12px 2px rgba(239,68,68,0.6);
  animation: leadGlow 1.6s ease-in-out infinite;
}
@keyframes leadGlow {
  0%,100% { box-shadow: 0 0 0 1px #ef4444, 0 0 8px 1px rgba(239,68,68,0.45); }
  50%     { box-shadow: 0 0 0 1px #ef4444, 0 0 16px 4px rgba(239,68,68,0.85); }
}
```

### 4. Drag Lead → Kladde
The existing drag-to-column handler just needs to accept the new column. Moving
a lead card into Kladde sets `status = 'draft'`:

```ts
await supabase.from('ef_offers').update({ status: 'draft' }).eq('id', offerId);
```

The card then leaves the Leads column and behaves like a normal draft offer
(client, contact, lead_source all already populated).

## Notes
- Leads have no `external_id`/dedupe — each inquiry is a fresh lead. Duplicates
  from the same customer are triaged/merged manually (ef_client_merges exists).
- Deliveries are logged in `public.zapier_webhook_log` (`ef_offer_id`, `status`,
  `payload`, `error`) — useful for debugging in the CrewCenter admin panel too.
