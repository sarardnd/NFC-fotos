export const MEDIA_BUCKET = "media";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function publicMediaUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}
