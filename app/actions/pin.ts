"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  verifyPin,
  createAccessToken,
  getClientIpHash,
  MAX_PIN_ATTEMPTS,
  LOCKOUT_MINUTES,
  ACCESS_COOKIE_PREFIX,
} from "@/lib/pin";

export type PinState = {
  error: string | null;
  blocked: boolean;
  lockedUntil: string | null;
};

export async function verifyAlbumPin(
  _prev: PinState,
  formData: FormData,
): Promise<PinState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!slug || !pin) {
    return { error: "Introduce el PIN.", blocked: false, lockedUntil: null };
  }

  const supabase = await createClient();
  const { data: album } = await supabase
    .from("albums")
    .select("id, pin_hash")
    .eq("slug", slug)
    .single();

  // Álbum no encontrado o sin PIN → no tiene sentido estar en /pin
  if (!album?.pin_hash) {
    redirect(`/album/${slug}`);
  }

  const ipHash = await getClientIpHash();

  // Comprobar bloqueo antes de gastar ciclos de CPU verificando el PIN (scrypt)
  const { data: lockRows } = await supabase.rpc("check_pin_lock", {
    p_album_id: album.id,
    p_ip_hash: ipHash,
  });
  const lock = lockRows?.[0];

  if (lock?.locked) {
    return { error: null, blocked: true, lockedUntil: lock.locked_until };
  }

  const isValid = verifyPin(pin, album.pin_hash);

  // Registrar el intento de forma atómica en la BD (no falsificable desde el cliente)
  const { data: attemptRows } = await supabase.rpc("register_pin_attempt", {
    p_album_id: album.id,
    p_ip_hash: ipHash,
    p_success: isValid,
    p_max_attempts: MAX_PIN_ATTEMPTS,
    p_lockout_minutes: LOCKOUT_MINUTES,
  });
  const outcome = attemptRows?.[0];

  if (!isValid) {
    if (outcome?.locked) {
      return { error: null, blocked: true, lockedUntil: outcome.locked_until };
    }
    const remaining = outcome?.attempts_remaining ?? 0;
    return {
      error: `PIN incorrecto. ${remaining} intento${remaining === 1 ? "" : "s"} restante.`,
      blocked: false,
      lockedUntil: null,
    };
  }

  // PIN correcto → emitir cookie de acceso (el intento ya se resetea en la BD)
  const cookieStore = await cookies();
  cookieStore.set(`${ACCESS_COOKIE_PREFIX}${album.id}`, createAccessToken(album.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  redirect(`/album/${slug}`);
}
