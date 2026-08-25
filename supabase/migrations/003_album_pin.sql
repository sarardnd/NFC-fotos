-- ============================================================
-- Album NFC — Migración 003: PIN por álbum
-- ============================================================
-- Añade la columna pin_hash (nullable) a la tabla albums.
-- NULL = álbum público; valor = álbum protegido con PIN.
-- El hash se genera con scrypt (salt:hash en hex) en el servidor.
-- ============================================================

alter table public.albums
  add column if not exists pin_hash text default null;
