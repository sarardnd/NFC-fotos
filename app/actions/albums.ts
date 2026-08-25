"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_ALBUM_EMOJI, isValidAlbumEmoji } from "@/lib/album-emojis";
import { countryNameFromCode } from "@/lib/countries";
import { hashPin } from "@/lib/pin";
import { randomSuffix, slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/storage";

export type CreateAlbumState = {
  error: string | null;
};

// ─── Helpers de autenticación ────────────────────────────────────────────────

async function requireAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  return user;
}

// ─── Crear álbum ─────────────────────────────────────────────────────────────

export async function createAlbum(
  _prevState: CreateAlbumState,
  formData: FormData,
): Promise<CreateAlbumState> {
  const name = String(formData.get("name") ?? "").trim();
  const countryCode = String(formData.get("country_code") ?? "").trim();
  const emojiInput = String(formData.get("emoji") ?? "").trim();
  const pinInput = String(formData.get("pin") ?? "").trim();

  if (!name || !countryCode) {
    return { error: "Faltan campos obligatorios." };
  }

  if (pinInput && (!/^\d{4,10}$/.test(pinInput))) {
    return { error: "El PIN debe tener entre 4 y 10 dígitos." };
  }

  const emoji = isValidAlbumEmoji(emojiInput) ? emojiInput : DEFAULT_ALBUM_EMOJI;
  const countryName = countryNameFromCode(countryCode);
  const baseSlug = slugify(name) || slugify(countryName) || "album";
  const pinHash = pinInput ? hashPin(pinInput) : null;

  const supabase = await createClient();

  // Verificar autenticación antes de cualquier operación de escritura
  try {
    await requireAuth(supabase);
  } catch {
    return { error: "No tienes permiso para crear álbumes." };
  }

  let slug = baseSlug;
  let attempt = 0;
  let insertedSlug: string | null = null;

  while (attempt < 5 && !insertedSlug) {
    const { error } = await supabase.from("albums").insert({
      name,
      emoji,
      country_code: countryCode,
      country_name: countryName,
      slug,
      pin_hash: pinHash,
    });

    if (!error) {
      insertedSlug = slug;
      break;
    }

    // Slug duplicado → reintentar con sufijo aleatorio
    if (error.code === "23505") {
      attempt += 1;
      slug = `${baseSlug}-${randomSuffix()}`;
      continue;
    }

    return { error: "No se pudo crear el álbum. Inténtalo de nuevo." };
  }

  if (!insertedSlug) {
    return { error: "No se pudo generar un slug único. Inténtalo de nuevo." };
  }

  revalidatePath("/app");
  redirect(`/album/${insertedSlug}`);
}

// ─── Gestionar PIN de un álbum existente ──────────────────────────────────────

export async function setAlbumPin(
  albumId: string,
  slug: string,
  pin: string,
): Promise<{ error: string | null }> {
  const trimmed = pin.trim();

  if (trimmed && !/^\d{4,10}$/.test(trimmed)) {
    return { error: "El PIN debe tener entre 4 y 10 dígitos." };
  }

  const supabase = await createClient();
  try {
    await requireAuth(supabase);
  } catch {
    return { error: "No tienes permiso." };
  }

  const pinHash = trimmed ? hashPin(trimmed) : null;
  const { error } = await supabase
    .from("albums")
    .update({ pin_hash: pinHash })
    .eq("id", albumId);

  if (error) return { error: "No se pudo actualizar el PIN." };

  revalidatePath(`/album/${slug}`);
  return { error: null };
}

// ─── Borrar álbum ─────────────────────────────────────────────────────────────

export async function deleteAlbum(
  albumId: string,
  slug: string,
): Promise<void> {
  const supabase = await createClient();
  await requireAuth(supabase);

  // Obtener todas las rutas de Storage para borrarlas
  const { data: mediaList } = await supabase
    .from("media")
    .select("storage_path")
    .eq("album_id", albumId);

  if (mediaList && mediaList.length > 0) {
    await supabase.storage
      .from(MEDIA_BUCKET)
      .remove(mediaList.map((m) => m.storage_path));
  }

  // Borrar álbum (la FK con cascade elimina los registros de media)
  await supabase.from("albums").delete().eq("id", albumId);

  revalidatePath("/app");
  redirect("/app");
}
