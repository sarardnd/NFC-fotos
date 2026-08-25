"use client";

import { useRef, useState } from "react";
import { registerMedia } from "@/app/actions/media";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/storage";

type UploadButtonProps = {
  albumId: string;
  slug: string;
};

export function UploadButton({ albumId, slug }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Solo se admiten imágenes y vídeos.");
        continue;
      }

      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${albumId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { cacheControl: "31536000" });

      if (uploadError) {
        setError("Error al subir la foto. Inténtalo de nuevo.");
        continue;
      }

      await registerMedia(albumId, slug, path, file.type);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center gap-2">
        {error && (
          <p className="rounded-full bg-lust/10 px-4 py-1.5 text-xs font-medium text-lust">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-14 min-h-[44px] items-center gap-2 rounded-full bg-tierra px-6 text-base font-semibold text-blanco shadow-lg shadow-tierra/30 transition-transform duration-150 hover:opacity-90 active:scale-95 disabled:opacity-60"
        >
          {uploading ? (
            "Subiendo…"
          ) : (
            <>
              <span aria-hidden>+</span> Añadir foto
            </>
          )}
        </button>
      </div>
    </div>
  );
}
