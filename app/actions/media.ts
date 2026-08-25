"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/storage";

// ─── Helper de autenticación ──────────────────────────────────────────────────

async function requireAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  return user;
}

// ─── Registrar foto tras subida al Storage ────────────────────────────────────

export async function registerMedia(
  albumId: string,
  slug: string,
  storagePath: string,
  mimeType: string,
): Promise<void> {
  const supabase = await createClient();
  await requireAuth(supabase);

  const { error } = await supabase.from("media").insert({
    album_id: albumId,
    storage_path: storagePath,
    mime_type: mimeType,
  });

  if (error) {
    throw new Error("No se pudo guardar la foto.");
  }

  // Si el álbum no tiene portada, asignar esta foto como portada automáticamente
  const { data: album } = await supabase
    .from("albums")
    .select("cover_path")
    .eq("id", albumId)
    .single();

  if (album && !album.cover_path) {
    await supabase
      .from("albums")
      .update({ cover_path: storagePath })
      .eq("id", albumId);
  }

  revalidatePath(`/album/${slug}`);
  revalidatePath("/app");
}

// ─── Borrar foto ──────────────────────────────────────────────────────────────

export async function deleteMedia(
  mediaId: string,
  storagePath: string,
  albumId: string,
  slug: string,
): Promise<void> {
  const supabase = await createClient();
  await requireAuth(supabase);

  // Borrar del bucket de Storage
  await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);

  // Borrar registro de la tabla media
  await supabase.from("media").delete().eq("id", mediaId);

  // Si era la portada del álbum, limpiarla
  const { data: album } = await supabase
    .from("albums")
    .select("cover_path")
    .eq("id", albumId)
    .single();

  if (album?.cover_path === storagePath) {
    await supabase
      .from("albums")
      .update({ cover_path: null })
      .eq("id", albumId);
  }

  revalidatePath(`/album/${slug}`);
  revalidatePath("/app");
}

// ─── Establecer portada ───────────────────────────────────────────────────────

export async function setAlbumCover(
  albumId: string,
  slug: string,
  storagePath: string,
): Promise<void> {
  const supabase = await createClient();
  await requireAuth(supabase);

  await supabase
    .from("albums")
    .update({ cover_path: storagePath })
    .eq("id", albumId);

  revalidatePath(`/album/${slug}`);
  revalidatePath("/app");
}
