"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-arena px-4">
      <div className="w-full max-w-sm rounded-3xl border border-surface-border bg-blanco p-8 shadow-lg shadow-piedra/10">
        {/* Cabecera */}
        <div className="mb-8 text-center">
          <p className="text-3xl">🔒</p>
          <h1 className="mt-3 text-2xl font-bold text-foreground">
            Acceso de administrador
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Solo el dueño puede gestionar este álbum.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="tu@email.com"
              className="h-12 min-h-[44px] w-full rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-tierra"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-12 min-h-[44px] w-full rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-tierra"
            />
          </div>

          {/* Error */}
          {state.error ? (
            <p
              role="alert"
              className="rounded-xl border border-lust/30 bg-lust/10 px-4 py-2.5 text-sm text-lust"
            >
              {state.error}
            </p>
          ) : null}

          {/* Botón */}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-tierra px-6 text-base font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        {/* Volver */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a
            href="/app"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Ver álbumes sin iniciar sesión
          </a>
        </p>
      </div>
    </main>
  );
}
