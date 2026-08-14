# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: TeamBattle CrewCenter (CCC / "CREW")

Internal crew hub for the TeamBattle event company — a single-page dashboard that links out to all company apps and hosts per-activity guides, scorecards, gear lists, video grids, file managers, error reporting, and admin tools for the team-building activities (TeamLazer, TeamRace, TeamConstruct, TeamControl, TeamBox, etc.).

- Folder is `CCC/`; it surfaces as **"CREW"** in the UI and in cross-project docs. The `package.json` name (`teambattle-occ`) and `deploy.sh`/`metadata.json` references to "OCC" are legacy artifacts — this is CrewCenter, not the OCC/FLOW task system (which it *reads from* — see Cross-project integration below).
- Danish language throughout the UI (activity names, labels, descriptions).

## Stack

- React 19 + TypeScript + Vite 5
- **Tailwind CSS v4 via the `@tailwindcss/vite` plugin** (NOT the CDN, NOT PostCSS). Theme lives in `app.css`: `@import "tailwindcss"` plus an `@theme` block defining the `battle-*` color palette (`battle-black #0a0a0a`, `battle-orange #ff6600`, …), `shadow-neon*` utilities, animations, and custom breakpoints. Full Tailwind v4 features (`@apply`, custom utilities) are available.
- Supabase (`@supabase/supabase-js`) — auth + database, the **MAIN** instance.
- `nuqs` — URL-backed view state (the app's "router"; see below).
- Anthropic API (called directly over `fetch`) for the in-app AI assistant. `@google/genai` is a leftover dependency and is **not** imported anywhere.
- `@react-oauth/google` (Google OAuth provider), `lucide-react` (icons).
- Netlify hosting.

## Commands

```bash
npm install            # repo is pnpm-locked (pnpm-lock.yaml); Netlify builds with `pnpm run build`
npm run dev            # vite dev server (house rule: open localhost in a NEW browser window)
npm run build          # tsc && vite build — typecheck + bundle. RUN THIS BEFORE ANY PUSH.
npm run preview        # serve the production build locally
```

- **No test runner is configured** — there is no `test` script. (Playwright is in devDependencies but unused by any script.)
- `tsc` is part of `build`; there is no separate `typecheck` script. Run `npm run build` to verify types — it must be green (errors block, warnings are fine) before pushing, because Netlify auto-deploys on push.

## Deployment

Deploy target is **crew.eventday.dk** (Netlify site `crewcenter`, id `d2ba717f-d545-4c64-9135-9326090c2457`). Do not deploy to any other site.

```bash
netlify deploy --prod --site d2ba717f-d545-4c64-9135-9326090c2457
```

⚠️ **`./deploy.sh` (and `npm run deploy`) does build → commit → `git push origin main` → `netlify deploy --prod` in one shot.** That violates the "never push or deploy without explicit acceptance" rule. Do not run it unless the user has explicitly approved a push *and* a prod deploy.

## Architecture (the big picture)

### One giant component + a URL-backed view router
`App.tsx` is a single ~2,050-line component. There is **no React Router**. Navigation is a `ViewState` string union with 100+ members (`'main' | 'crew_hub' | 'teamlazer' | 'fejlsogning_teambox' | …`) rendered by ~200 `currentView === '…'` conditional blocks. The active view is stored in the URL via `nuqs`:

```ts
const [currentViewRaw, setCurrentViewRaw] = useQueryState('view', parseAsString.withDefault('main').withOptions({ history: 'push' }));
```

Consequences worth knowing before editing navigation:
- Every view is **deep-linkable** (`?view=teamlazer`) and **browser back/forward** walks the in-app history (because `history: 'push'`). `setCurrentView('main')` clears the param.
- Adding a screen = (1) add a literal to the `ViewState` union, (2) add a render branch in `App.tsx`, (3) usually add an entry to a `*_LINKS` array in `constants.ts` so a `HubButton` navigates to it.
- `main` is the **instructor landing portal** (`components/InstructorLanding.tsx`) — app shortcuts as round logo tiles. The activity hub (the old 2×2 `HUB_LINKS` grid) lives at `crew_hub`, reached via the portal's CREWCONTROLCENTER tile. `handleBackClick` routes sub-views → `crew_hub` and `crew_hub` → `main`.

### Content is data-driven from `constants.ts`
The hub's link groups are exported arrays of `HubLink` (`HUB_LINKS`, `ACTIVITY_LINKS`, `OFFICE_LINKS`, `TEAMLAZER_LINKS`, …) plus `*_VIDEO_INDEX` maps. `HubButton` + the grid CSS render them. Per-activity content (guides, scorecards, gear lists, video grids, file managers) are individual flat components in `components/`. Editable guide content is **not** hardcoded — it lives in the `guide_sections` Supabase table and is edited in-app.

### Auth & two permission layers (`contexts/AuthContext.tsx`)
- Primary auth is Supabase **email/password**. A `GoogleOAuthProvider` also wraps the app (`VITE_GOOGLE_CLIENT_ID`).
- **Role hierarchy:** `INSTRUCTOR (1) < GAMEMASTER (2) < ADMIN (3)`. Gate features with `hasPermission(role | role[])`.
- On login the context sets an **optimistic fallback profile** (role `INSTRUCTOR`) immediately and fetches the real profile from the `users` table in the background (with a 5s timeout in `getUserProfile`) so the UI never blocks on the DB. Don't assume `profile.role` is final on first render.
- **Second, finer-grained layer:** per-key booleans in the `ccc_permissions` table (`fetchCCCPermissions`), surfaced through `getPermissions` / `getUserActivityPermissions` exported from `components/UsersManagement.tsx`. Role checks and per-key checks coexist.

### Data layer: `lib/supabase.ts` → MAIN instance
- The Supabase URL + anon key for the **MAIN** project (`ilbjytyukicbssqftmma`) are **hardcoded** in `lib/supabase.ts`. The service-role key (`VITE_SUPABASE_SERVICE_ROLE_KEY`) is used **only** for admin password resets via the Auth Admin REST API.
- `lib/supabase.ts` is the central data layer — almost every DB call (users, activity logs, scorecards, guide sections, jobs, vehicles, fejlrapporter, ideas, landing-sites catalog) is a typed helper here. Add new queries here rather than calling `supabase.from(...)` ad hoc in components.
- Other `lib/` modules are external-service clients, each kept out of `supabase.ts`: `activityNames.ts` (OCC activity-id ↔ name bridge), `zapier.ts` (Zapier admin/log helpers), plus the two integrations below.

### External integrations: Google Photos & LiveGPS
- **Google Photos** (`lib/googlePhotos.ts`): direct `fetch` to `photoslibrary.googleapis.com/v1` with a `Bearer` **OAuth access token** (from the `@react-oauth/google` flow, Photos Library scope) — not the Supabase session. Surfaced by `GooglePhotosView` / `AlbumGrid` / `PhotoGrid` / `PhotoUpload`.
- **LiveGPS** (`lib/livegps.ts`): real-time vehicle/device tracking. The client does **not** call the GPS provider directly — it goes through a **`livegps-proxy` Supabase edge function** (`{SUPABASE_URL}/functions/v1/livegps-proxy`) that holds the upstream credentials. Used by `LiveGPSPanel` and `TeamLazerGearList`. ⚠️ `livegps-proxy` is **deployed but not in this repo** — only `zapier-jobs` lives in `supabase/functions/`. Edit it via the Supabase dashboard/CLI, not here.

### Cross-project integration (CCC reads/writes shared MAIN tables)
CCC is a consumer of data other TeamBattle projects own. Treat these tables as read-mostly:
- **Task/job system (OCC/FLOW):** `task_jobs` (looked up by 4-digit `short_code`), `employees`, `job_crew_assignments`, `job_vehicle_assignments`, `activities`, `cars`, `trailers`. The `ACTIVITY_TO_VIEW` map in `lib/supabase.ts` and `lib/activityNames.ts` bridge OCC activity IDs (`A1`–`A12`) to CCC view states / display names.
- **TODO:** error reports ("fejlrapporter") and idea-box submissions are inserted into the shared `todos` table, assigned to Maria (`emp_z4ftvagjq`). Urgent ("HASTER") reports also write rows to `notifications` for 3 admins and invoke the `send-fejlrapport-email` edge function.
- **App catalog (APP/Toolbox):** the instructor portal reads the `landing_sites` table (public read where `active=true`) for app logos via `fetchLandingSites()` — same icons as app.eventday.dk. Read-only; APP/Toolbox own it.
- **WELCOME handbook (CREW GUIDE):** `components/CrewGuide.tsx` (view `crew_guide`, reached from a tile on the instructor portal) renders the employee handbook from `welcome_step_buttons` where `step_id='klar'`, via `fetchWelcomeGuideButtons()`. WELCOME owns the table and edits it in its per-step editor — CREW is read-only, so the handbook lives in one place. Titles carry emoji prefixes in the data; `CrewGuide` strips them for display and shows a keyword-mapped white Lucide icon instead (house rule: no emoji as UI icons).
- **Inbound Zapier webhooks → EventDay leads:** the `supabase/functions/zapier-jobs` edge function ingests external booking inquiries (auth via `x-zapier-secret` → `ZAPIER_WEBHOOK_SECRET` env or `integration_config` table) and creates **EventDay leads**: an `ef_offers` row with `status='lead'` (new allowed status — the offers board's "Leads" column before Kladde) + `ef_clients` + `ef_contacts`, with the incoming `source` auto-registered in `ef_leads` (case-insensitive) and linked via `lead_id`/`lead_source`/`bureau_name`. Danish `dd/mm/yyyy` dates → `event_date`+`event_start_time`; each delivery logged to `zapier_webhook_log` (`ef_offer_id`). The EventDay board UI (Leads column, realtime, glow, drag→Kladde) lives in the **separate `eventday` repo** — spec in `supabase/functions/zapier-jobs/EVENTDAY_LEADS_UI.md`. Admin/log UI here: `components/ZapierIntegration.tsx` (+ `lib/zapier.ts`), under Opgaver → Admin.
- **Realtime:** `subscribeFejlsogningReports` listens on `fejlsogning_reports` to drive the unread-error badge.

When a change touches these tables, remember other repos depend on their shape — coordinate, don't restructure.

### Responsive system: 5 explicit device modes
`hooks/useDeviceMode.ts` classifies the viewport into `mobile-portrait | mobile-landscape | tablet-portrait | tablet-landscape | desktop` and `getResponsiveClasses(mode)` returns Tailwind class strings per mode. `app.css` mirrors this with `.responsive-*` classes per breakpoint. `components/DevicePreview.tsx` provides an in-app toolbar to simulate devices. Prefer these helpers over ad-hoc `sm:`/`md:` when sizing the hub grid/buttons.

### Intro animation
`components/IntroAnimation.tsx` + `intro.css` play once per session, gated on `sessionStorage.getItem('introSeen')`.

### `supabase/` directory
Local Supabase CLI project: `config.toml`, RLS/storage SQL, `migrations/`, and `functions/` (edge functions). Only `zapier-jobs` is checked in here; other deployed functions (e.g. `livegps-proxy`) live only on Supabase. Edge functions are **Deno**, built/deployed via the Supabase CLI and **excluded from the frontend `tsconfig`** — `npm run build` does not typecheck them. Schema changes for CCC-owned tables go in `migrations/`.

`scripts/` holds one-off helpers (`setup-supabase.sql`, `start-claude-dev.sh`) — not part of the app build.

## Environment variables (all `VITE_`-prefixed except the legacy polyfill)

| Var | Used for |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | In-app AI assistant (`ClaudeAssistant.tsx`, `DistanceTool.tsx`) — direct `x-api-key` fetch to Anthropic |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth provider in `index.tsx` |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Admin password resets only |
| `API_KEY` / `GEMINI_API_KEY` | Polyfilled in `vite.config.ts` (`process.env.API_KEY`) but effectively unused — legacy |

`.env*` is gitignored. Never commit secrets; production keys live in Netlify env vars. Edge-function secrets (e.g. `ZAPIER_WEBHOOK_SECRET`) live in Supabase, not in the frontend `.env`.

## Conventions

- **No `src/` directory.** Entry files (`App.tsx`, `index.tsx`, `constants.ts`, `types.ts`) are in the project root; all components are flat in `components/` (no nesting). `lib/`, `hooks/`, `contexts/` hold the data layer, the device hook, and AuthContext respectively.
- Comments: Danish for *why*, English for *what*.
- **Icons:** always white, real SVG (Lucide) — never colored/black unless asked, and never emojis as UI icons (emojis in text content like notifications are fine).
- **Git:** commit locally and freely; **never `git push` or deploy without explicit user acceptance.** Before any push, run `npm run build` and confirm it's green.

## Self-maintenance instructions

After completing any significant task, update this CLAUDE.md if:
- A new pattern, convention, or architectural decision was established.
- A recurring problem was solved in a way worth remembering.
- A new tool, library, integration, or env var was added.
- You discovered something about the structure worth noting.

Keep entries concise. Remove outdated entries. Never ask permission to update this file.

## URL-tilstand: nuqs som standard

Brug **nuqs** som standardvalg til al "URL-værdig" tilstand i alle projekter
(React + Vite / React Router). Wrap app'en i den rette NuqsAdapter.

✅ BRUG nuqs til: filtre, faner, søgeord, paginering, valgt element, wizard-trin
   → så links kan deles/bogmærkes, tilbage-knappen virker, og reload bevarer tilstanden.

❌ BRUG IKKE nuqs til:
   - Flygtig UI-tilstand (åben menu, hover, uafsendt formular) → lokal state (useState).
   - Server-data (Supabase) → dataLaget/React Query, ikke URL.
   - Følsomme data → ALDRIG i URL'en (logges/deles = privacy-fælde).
   - Realtids/tunge data (fx GPS-spillets live-position, svar, billeder, videoklip)
     → gentagne URL-opdateringer giver performance-problemer. Hold det ude af URL'en.

Tommelfinger: skal tilstanden kunne deles via et link og overleve en reload?
→ nuqs. Ellers ikke.

## Datahentning fra Supabase

Hent ALTID data gennem et data-lag (TanStack/React Query) — aldrig løse fetch-kald
spredt i komponenterne. Det giver caching, automatisk genhentning og ét sted at rette.

✅ ALTID:
   - Vis tydelig loading- OG fejl-tilstand. Intet må "hænge" uden feedback til brugeren.
   - Hent kun de kolonner/rækker der bruges (undgå SELECT *), og undgå N+1 (hent i ét kald).
   - Stol på RLS som sikkerhedslag — filtrér ikke kun i frontend.
   - Brug realtime/subscriptions sparsomt — kun hvor live-opdatering giver reel værdi.

❌ ALDRIG:
   - Læg forretningslogik/adgangskontrol i frontend alene.
   - Hent hele tabeller for at filtrere i browseren.

Tommelfinger: én kilde til data (query-laget), tydelige tilstande, mindst mulig data hentet.

## Communication rules (IMPORTANT)

- **Never paste raw bot or webhook content into chat.** This applies to
  deploy bots (Netlify, Vercel, etc.), GitHub event payloads, CI logs, and
  API responses: do not echo raw JSON, escaped HTML, hidden HTML comments,
  or markdown tables verbatim.
- Summarize such content in one or two plain sentences with at most the one
  or two relevant links, e.g. "Netlify deploy preview is ready: <URL>".
- Keep chat replies short and human-readable; the user often reads them on a
  phone.

## Task tracking (IMPORTANT)

- At the start of every session, create a todo list from the user's requests
  (use the task/todo tools): one item per thing the user asks for.
- Update the list as work proceeds — mark items in progress when started and
  completed as each fix lands — so the user can always see current status.
- When the user adds new requests mid-session, add them to the list
  immediately; never leave the list stale.
