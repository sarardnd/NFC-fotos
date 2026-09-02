"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

/**
 * Inicia sesión con email + contraseña.
 * Si las credenciales son correctas, Supabase guarda la sesión en cookies
 * y redirigimos a /app (donde los controles de admin ya serán visibles).
 */
export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Introduce el email y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Log temporal para diagnosticar el fallo real en Vercel → Logs
    console.error("signIn error:", error.message, error.status);
    // No revelar si el email existe o no (previene enumeración de usuarios)
    return { error: "Credenciales incorrectas. Inténtalo de nuevo." };
  }

  redirect("/app");
}

/**
 * Cierra la sesión activa y redirige a la landing pública.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/app");
}
