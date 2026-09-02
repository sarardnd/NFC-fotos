-- ============================================================
-- Album NFC — Migración 004: Rate-limit real del PIN (por IP)
-- ============================================================
-- Sustituye el conteo de intentos basado en cookies (fácil de
-- evadir borrando cookies) por un contador en base de datos,
-- ligado a álbum + IP del visitante, con bloqueo temporal.
-- ============================================================

create table if not exists public.pin_attempts (
  album_id     uuid        not null references public.albums(id) on delete cascade,
  ip_hash      text        not null,
  attempts     int         not null default 0,
  locked_until timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (album_id, ip_hash)
);

-- RLS habilitado y sin políticas: solo accesible vía las funciones
-- SECURITY DEFINER de abajo, nunca directamente desde el cliente.
alter table public.pin_attempts enable row level security;

-- ── Consultar si un álbum+IP está bloqueado (no muta estado) ──────────

create or replace function public.check_pin_lock(
  p_album_id uuid,
  p_ip_hash  text
)
returns table (locked boolean, locked_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.pin_attempts;
begin
  select * into v_row from public.pin_attempts
    where album_id = p_album_id and ip_hash = p_ip_hash;

  if v_row.album_id is null or v_row.locked_until is null or v_row.locked_until <= now() then
    return query select false, null::timestamptz;
  else
    return query select true, v_row.locked_until;
  end if;
end;
$$;

-- ── Registrar un intento (correcto o fallido) de forma atómica ────────

create or replace function public.register_pin_attempt(
  p_album_id        uuid,
  p_ip_hash         text,
  p_success         boolean,
  p_max_attempts    int default 2,
  p_lockout_minutes int default 15
)
returns table (locked boolean, locked_until timestamptz, attempts_remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.pin_attempts;
begin
  -- Bloqueo de fila para evitar condiciones de carrera con peticiones simultáneas
  select * into v_row from public.pin_attempts
    where album_id = p_album_id and ip_hash = p_ip_hash
    for update;

  if v_row.album_id is null then
    insert into public.pin_attempts (album_id, ip_hash, attempts, locked_until)
    values (p_album_id, p_ip_hash, 0, null)
    returning * into v_row;
  end if;

  -- Si el bloqueo anterior ya expiró, resetear el contador
  if v_row.locked_until is not null and v_row.locked_until <= now() then
    v_row.attempts := 0;
    v_row.locked_until := null;
  end if;

  -- Si sigue bloqueado, no consumir el intento
  if v_row.locked_until is not null and v_row.locked_until > now() then
    return query select true, v_row.locked_until, 0;
    return;
  end if;

  if p_success then
    update public.pin_attempts
      set attempts = 0, locked_until = null, updated_at = now()
      where album_id = p_album_id and ip_hash = p_ip_hash;
    return query select false, null::timestamptz, p_max_attempts;
    return;
  end if;

  v_row.attempts := v_row.attempts + 1;

  if v_row.attempts >= p_max_attempts then
    v_row.locked_until := now() + (p_lockout_minutes || ' minutes')::interval;
  end if;

  update public.pin_attempts
    set attempts = v_row.attempts, locked_until = v_row.locked_until, updated_at = now()
    where album_id = p_album_id and ip_hash = p_ip_hash;

  if v_row.locked_until is not null then
    return query select true, v_row.locked_until, 0;
  else
    return query select false, null::timestamptz, greatest(p_max_attempts - v_row.attempts, 0);
  end if;
end;
$$;

grant execute on function public.check_pin_lock(uuid, text) to anon, authenticated;
grant execute on function public.register_pin_attempt(uuid, text, boolean, int, int) to anon, authenticated;
