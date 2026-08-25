import { createClient } from "@/lib/supabase/server";
import type { Album, Media } from "@/lib/types";

const ALBUM_FIELDS =
  "id, name, emoji, slug, country_code, country_name, cover_path, pin_hash";

export async function getAlbums(): Promise<Album[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select(ALBUM_FIELDS)
    .order("created_at", { ascending: false });
  return (data ?? []) as Album[];
}

export async function getAlbumBySlug(
  slug: string,
): Promise<{ album: Album; media: Media[] } | null> {
  const supabase = await createClient();

  const { data: album } = await supabase
    .from("albums")
    .select(ALBUM_FIELDS)
    .eq("slug", slug)
    .single();

  if (!album) return null;

  const { data: media } = await supabase
    .from("media")
    .select("id, album_id, storage_path, mime_type, created_at")
    .eq("album_id", album.id)
    .order("created_at", { ascending: true });

  return { album: album as Album, media: (media ?? []) as Media[] };
}
