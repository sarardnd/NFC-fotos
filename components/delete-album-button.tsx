"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAlbum } from "@/app/actions/albums";

type DeleteAlbumButtonProps = {
  albumId: string;
  slug: string;
};

export function DeleteAlbumButton({ albumId, slug }: DeleteAlbumButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirm("¿Borrar este álbum y todas sus fotos? Esta acción no se puede deshacer.")) {
      return;
    }
    startTransition(async () => {
      await deleteAlbum(albumId, slug);
      router.push("/app");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex h-10 min-h-[44px] items-center justify-center rounded-full border border-lust/40 px-4 text-sm font-medium text-lust transition-transform duration-150 hover:bg-lust hover:text-blanco active:scale-95 disabled:opacity-50"
    >
      {isPending ? "Borrando…" : "Borrar álbum"}
    </button>
  );
}
