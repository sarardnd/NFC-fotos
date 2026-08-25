"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createAlbum, type CreateAlbumState } from "@/app/actions/albums";
import { getAllCountries } from "@/lib/countries";

const countries = getAllCountries();
const initial: CreateAlbumState = { error: null };

export function CreateAlbumLauncher() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createAlbum, initial);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-tierra px-6 text-base font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 sm:w-auto"
      >
        <span aria-hidden>+</span> Nuevo álbum
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-sm rounded-3xl border border-surface-border bg-blanco p-6 shadow-xl shadow-piedra/15"
              initial={{ y: 24, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-lg font-bold text-foreground">Nuevo álbum</h2>

              <form action={formAction} className="mt-5 flex flex-col gap-3">
                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nombre
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    autoFocus
                    placeholder="Japón 2024"
                    className="h-12 rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-tierra"
                  />
                </div>

                {/* País */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    País
                  </label>
                  <select
                    name="country_code"
                    required
                    defaultValue=""
                    className="h-12 rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground outline-none focus:border-tierra"
                  >
                    <option value="" disabled>
                      Selecciona un país…
                    </option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Emoji (opcional) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Emoji <span className="normal-case font-normal">(opcional)</span>
                  </label>
                  <input
                    name="emoji"
                    type="text"
                    placeholder="🗼"
                    className="h-12 rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-tierra"
                  />
                </div>

                {/* PIN (opcional) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    PIN <span className="normal-case font-normal">(opcional, 4–10 dígitos)</span>
                  </label>
                  <input
                    name="pin"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    minLength={4}
                    maxLength={10}
                    placeholder="Déjalo vacío para álbum público"
                    className="h-12 rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-tierra"
                  />
                </div>

                {state.error && (
                  <p className="rounded-xl bg-lust/10 px-4 py-2.5 text-sm font-medium text-lust">
                    {state.error}
                  </p>
                )}

                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-12 min-h-[44px] flex-1 items-center justify-center rounded-full border border-surface-border text-sm font-medium text-muted-foreground transition-transform duration-150 hover:border-foreground/20 active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-12 min-h-[44px] flex-1 items-center justify-center rounded-full bg-tierra text-sm font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {pending ? "Creando…" : "Crear →"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
