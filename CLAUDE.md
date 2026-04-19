# Project: TeamBattle CrewCenter (CCC)

Internal crew hub for TeamBattle event company — guides, packing lists, scorecards, admin tools, and activity management for team-building activities (TeamLazer, TeamRace, TeamConstruct, TeamControl, etc.).

## Stack
- React 19 + TypeScript + Vite 5
- Tailwind CSS (CDN, configured inline in `index.html`)
- Supabase (auth + database via `@supabase/supabase-js`)
- Google Gemini API (`@google/genai`) for AI assistant features
- Google OAuth (`@react-oauth/google`)
- Lucide React for icons
- Netlify (hosting)

## Deployment

Always deploy to **crew.eventday.dk** (Netlify site: crewcenter). Do not deploy to any other site.

```bash
netlify deploy --prod --site d2ba717f-d545-4c64-9135-9326090c2457
```

## Key conventions
- Always use `npx vite` with `server: { open: true }`
- After completing work, always `git commit` automatically — but **never** `git push` or deploy unless explicitly told to
- Source files live in project root (`App.tsx`, `index.tsx`, `constants.ts`, `types.ts`)
- Components live in `components/` (58+ component files, no subdirectory nesting)
- Tailwind is loaded via CDN `<script>` in `index.html` with inline config — not PostCSS
- Danish language throughout the UI (activity names, labels, descriptions)

## Active patterns
- Hub-style navigation with categorized link groups defined in `constants.ts`
- Per-activity components: guides, packing lists, scorecards, gear lists, video grids
- Admin components for maintenance, reports, user management
- `ActivityFileManager` for file/document management per activity
- Supabase used for persistent state (shopping lists, gear, jobs, etc.)

## Known issues / gotchas
- Tailwind is CDN-based (not build-step) — no `@apply` or PostCSS plugins available
- `vite.config.ts` polyfills `process.env.API_KEY` for browser use
- No `src/` directory — all `.tsx` files are in root or `components/`

## Recent decisions
- Added fullscreen intro animation with accessibility and click guard (82afe8c)
- Synced TeamLazer with OCC for dansk descriptions + weapon support (8126562)
- Added Vedligeholdelse admin section for cross-activity gear management (307c690)
- Added persistent shopping list (Indkob) stored in Supabase (f7512de)

## Self-maintenance instructions

After completing any significant task, automatically update this CLAUDE.md file if:
- A new pattern, convention, or architectural decision was established
- A recurring problem was solved in a way worth remembering
- A new tool, library, or integration was added to the project
- You discovered something about the codebase structure worth noting

Keep entries concise. Remove outdated entries. Never ask for permission to update this file.
