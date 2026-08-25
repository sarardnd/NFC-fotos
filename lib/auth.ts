import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve true si hay un usuario autenticado en la sesión actual.
 * Usa auth.getUser() (verificado en el servidor) en lugar de getSession()
 * para evitar que una sesión manipulada en el cliente engañe al servidor.
 */
export async function getIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}
