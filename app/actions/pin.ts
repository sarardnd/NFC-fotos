"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  verifyPin,
  createAccessToken,
  createTriesToken,
  readTriesToken,
  MAX_PIN_ATTEMPTS,
  ACCESS_COOKIE_PREFIX,
  TRIES_COOKIE_PREFIX,
} from "@/lib/pin";

export type PinState = {
  error: string | null;
  blocked: boolean;
};

export async function verifyAlbumPin(
  _prev: PinState,
  formData: FormData,
): Promise<PinState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!slug || !pin) {
    return { error: "Introduce el PIN.", blocked: false };
  }

  const cookieStore = await cookies();

  // Comprobar intentos previos antes de tocar la BD
  const triesRaw = cookieStore.get(`${TRIES_COOKIE_PREFIX}${slug}`)?.value ?? "";
  const currentTries = readTriesToken(triesRaw, slug);

  if (currentTries >= MAX_PIN_ATTEMPTS) {
    return { error: null, blocked: true };
  }

  // Obtener el hash del álbum
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

  if (!verifyPin(pin, album.pin_hash)) {
    const newTries = currentTries + 1;

    cookieStore.set(`${TRIES_COOKIE_PREFIX}${slug}`, createTriesToken(slug, newTries), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    if (newTries >= MAX_PIN_ATTEMPTS) {
      return { error: null, blocked: true };
    }

    const remaining = MAX_PIN_ATTEMPTS - newTries;
    return {
      error: `PIN incorrecto. ${remaining} intento${remaining === 1 ? "" : "s"} restante.`,
      blocked: false,
    };
  }

  // PIN correcto → emitir cookie de acceso y limpiar intentos
  cookieStore.set(`${ACCESS_COOKIE_PREFIX}${album.id}`, createAccessToken(album.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  cookieStore.delete(`${TRIES_COOKIE_PREFIX}${slug}`);

  redirect(`/album/${slug}`);
}
