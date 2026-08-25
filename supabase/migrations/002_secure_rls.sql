-- ============================================================
-- Album NFC — Migración 002: RLS seguro (solo el dueño escribe)
-- ============================================================
-- Ejecutar en Supabase: Dashboard → SQL Editor → Run
-- Requisito previo: migración 001 ya aplicada.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- TABLA: albums
-- ──────────────────────────────────────────────────────────

-- Eliminar políticas abiertas del MVP
drop policy if exists "albums_select_anon"  on public.albums;
drop policy if exists "albums_insert_anon"  on public.albums;
drop policy if exists "albums_update_anon"  on public.albums;
drop policy if exists "albums_delete_anon"  on public.albums;

-- Cualquiera puede leer álbumes (visitantes con pegatina NFC)
create policy "albums_select_public"
  on public.albums for select
  to anon, authenticated
  using (true);

-- Solo el usuario autenticado (el dueño) puede crear / modificar / borrar
create policy "albums_insert_owner"
  on public.albums for insert
  to authenticated
  with check (true);

create policy "albums_update_owner"
  on public.albums for update
  to authenticated
  using (true)
  with check (true);

create policy "albums_delete_owner"
  on public.albums for delete
  to authenticated
  using (true);

-- ──────────────────────────────────────────────────────────
-- TABLA: media
-- ──────────────────────────────────────────────────────────

drop policy if exists "media_select_anon"  on public.media;
drop policy if exists "media_insert_anon"  on public.media;
drop policy if exists "media_update_anon"  on public.media;
drop policy if exists "media_delete_anon"  on public.media;

create policy "media_select_public"
  on public.media for select
  to anon, authenticated
  using (true);

create policy "media_insert_owner"
  on public.media for insert
  to authenticated
  with check (true);

create policy "media_update_owner"
  on public.media for update
  to authenticated
  using (true)
  with check (true);

create policy "media_delete_owner"
  on public.media for delete
  to authenticated
  using (true);

-- ──────────────────────────────────────────────────────────
-- STORAGE: bucket "media"
-- ──────────────────────────────────────────────────────────

drop policy if exists "media_bucket_select" on storage.objects;
drop policy if exists "media_bucket_insert" on storage.objects;
drop policy if exists "media_bucket_update" on storage.objects;
drop policy if exists "media_bucket_delete" on storage.objects;

-- Las fotos son públicas (las URLs son directas, sin token)
create policy "media_bucket_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- Solo el dueño autenticado puede subir / modificar / borrar archivos
create policy "media_bucket_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "media_bucket_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy "media_bucket_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
