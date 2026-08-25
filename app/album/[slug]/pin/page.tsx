import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PinEntry } from "@/components/pin-entry";
import { getIsAdmin } from "@/lib/auth";
import {
  ACCESS_COOKIE_PREFIX,
  MAX_PIN_ATTEMPTS,
  TRIES_COOKIE_PREFIX,
  readTriesToken,
  verifyAccessToken,
} from "@/lib/pin";
import { createClient } from "@/lib/supabase/server";

export default async function PinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: album } = await supabase
    .from("albums")
    .select("id, name, emoji, pin_hash")
    .eq("slug", slug)
    .single();

  if (!album) notFound();

  // Álbum sin PIN → no hay nada que proteger
  if (!album.pin_hash) redirect(`/album/${slug}`);

  // El admin no necesita PIN
  const isAdmin = await getIsAdmin();
  if (isAdmin) redirect(`/album/${slug}`);

  const cookieStore = await cookies();

  // Ya tiene acceso válido
  const accessRaw = cookieStore.get(`${ACCESS_COOKIE_PREFIX}${album.id}`)?.value;
  if (accessRaw && verifyAccessToken(accessRaw, album.id)) {
    redirect(`/album/${slug}`);
  }

  // Comprobar intentos previos para mostrar la UI bloqueada directamente
  const triesRaw = cookieStore.get(`${TRIES_COOKIE_PREFIX}${slug}`)?.value ?? "";
  const isBlocked = readTriesToken(triesRaw, slug) >= MAX_PIN_ATTEMPTS;

  return (
    <PinEntry
      slug={slug}
      albumName={album.name}
      albumEmoji={album.emoji}
      isBlocked={isBlocked}
    />
  );
}
