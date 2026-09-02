import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PinEntry } from "@/components/pin-entry";
import { getIsAdmin } from "@/lib/auth";
import { ACCESS_COOKIE_PREFIX, getClientIpHash, verifyAccessToken } from "@/lib/pin";
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

  // Comprobar bloqueo real en BD (por álbum + IP), no evadible borrando cookies
  const ipHash = await getClientIpHash();
  const { data: lockRows } = await supabase.rpc("check_pin_lock", {
    p_album_id: album.id,
    p_ip_hash: ipHash,
  });
  const lock = lockRows?.[0];

  return (
    <PinEntry
      slug={slug}
      albumName={album.name}
      albumEmoji={album.emoji}
      isBlocked={!!lock?.locked}
      lockedUntil={lock?.locked_until ?? null}
    />
  );
}
