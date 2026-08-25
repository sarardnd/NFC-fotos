-- ============================================================
-- Album NFC — Migración 001: Schema inicial
-- ============================================================
-- Ejecutar ANTES que 002 y 003.
-- ============================================================

-- ── Tablas ────────────────────────────────────────────────

create table if not exists public.albums (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  emoji        text        not null default '📷',
  slug         text        unique not null,
  country_code text        not null,
  country_name text        not null,
  cover_path   text,
  created_at   timestamptz default now()
);

create table if not exists public.media (
  id           uuid        primary key default gen_random_uuid(),
  album_id     uuid        not null references public.albums(id) on delete cascade,
  storage_path text        not null,
  mime_type    text        not null,
  created_at   timestamptz default now()
);

-- ── RLS (habilitado, políticas abiertas — 002 las restringe) ──

alter table public.albums enable row level security;
alter table public.media   enable row level security;

create policy "albums_select_anon" on public.albums for select to anon, authenticated using (true);
create policy "albums_insert_anon" on public.albums for insert to anon              with check (true);
create policy "albums_update_anon" on public.albums for update to anon              using (true);
create policy "albums_delete_anon" on public.albums for delete to anon              using (true);

create policy "media_select_anon"  on public.media  for select to anon, authenticated using (true);
create policy "media_insert_anon"  on public.media  for insert to anon               with check (true);
create policy "media_update_anon"  on public.media  for update to anon               using (true);
create policy "media_delete_anon"  on public.media  for delete to anon               using (true);

-- ── Bucket de Storage ─────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
