-- Checklist mode: app-nøglen åbnes for ALLE apps (var låst til flow/crew/eventday).
-- KØRT på MAIN 2026-10-22 via Supabase-MCP. Kilden: teambattle-workspace/checklist-kit/migration.sql
-- 2026-10-22: app-nøglen er åben for alle apps (var låst til flow/crew/eventday).
alter table public.cm_packages drop constraint if exists cm_packages_app_check;
alter table public.cm_packages add constraint cm_packages_app_check check (app ~ '^[a-z0-9][a-z0-9_-]{1,39}$');
alter table public.cm_items drop constraint if exists cm_items_app_check;
alter table public.cm_items add constraint cm_items_app_check check (app ~ '^[a-z0-9][a-z0-9_-]{1,39}$');
