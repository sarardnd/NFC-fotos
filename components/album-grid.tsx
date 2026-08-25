import Image from "next/image";
import Link from "next/link";
import { publicMediaUrl } from "@/lib/storage";
import type { Album } from "@/lib/types";

type AlbumGridProps = {
  albums: Album[];
};

export function AlbumGrid({ albums }: AlbumGridProps) {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <span className="text-5xl">🗺️</span>
        <p className="text-base font-medium text-foreground">Sin álbumes todavía</p>
        <p className="text-sm text-muted-foreground">
          Crea el primero con el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/album/${album.slug}`}
          className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface transition-transform duration-150 active:scale-[0.98]"
        >
          {/* Imagen de portada */}
          {album.cover_path ? (
            <Image
              src={publicMediaUrl(album.cover_path)}
              alt={album.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-4xl">
              {album.emoji}
            </div>
          )}

          {/* Degradado + info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent p-3 pt-8">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-blanco">
                  {album.name}
                </p>
                <p className="truncate text-[11px] text-blanco/70">{album.country_name}</p>
              </div>
              {/* Indicador de PIN */}
              {album.pin_hash && (
                <span
                  title="Álbum protegido con PIN"
                  className="shrink-0 rounded-full bg-blanco/20 px-1.5 py-0.5 text-[10px] text-blanco backdrop-blur-sm"
                >
                  🔒
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
