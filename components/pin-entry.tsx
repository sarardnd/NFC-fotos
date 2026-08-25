"use client";

import { useActionState } from "react";
import { verifyAlbumPin, type PinState } from "@/app/actions/pin";

type Props = {
  slug: string;
  albumName: string;
  albumEmoji: string;
  isBlocked: boolean;
};

const initial: PinState = { error: null, blocked: false };

export function PinEntry({ slug, albumName, albumEmoji, isBlocked }: Props) {
  const [state, formAction, pending] = useActionState(verifyAlbumPin, initial);
  const blocked = isBlocked || state.blocked;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-arena px-4">
      <div className="w-full max-w-sm rounded-3xl border border-surface-border bg-blanco p-8 shadow-lg shadow-piedra/10">
        <div className="mb-8 text-center">
          <p className="text-4xl">{albumEmoji}</p>
          <h1 className="mt-3 text-xl font-bold text-foreground">{albumName}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Este álbum está protegido con PIN.
          </p>
        </div>

        {blocked ? (
          <div className="rounded-2xl bg-lust/10 px-5 py-4 text-center">
            <p className="text-sm font-medium text-lust">
              Demasiados intentos incorrectos.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cierra el navegador y vuelve a intentarlo.
            </p>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="slug" value={slug} />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="pin"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Código PIN
              </label>
              <input
                id="pin"
                name="pin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={4}
                maxLength={10}
                required
                autoFocus
                autoComplete="one-time-code"
                placeholder="• • • •"
                className="h-14 min-h-[44px] w-full rounded-xl border border-surface-border bg-arena px-4 text-center text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-tierra"
              />
            </div>

            {state.error && (
              <p className="rounded-xl bg-lust/10 px-4 py-2.5 text-center text-sm font-medium text-lust">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-tierra px-6 text-base font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {pending ? "Verificando…" : "Acceder →"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
