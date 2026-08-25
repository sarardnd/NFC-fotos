import Link from "next/link";
import { redirect } from "next/navigation";
import { getIsAdmin } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

export default async function AdminPage() {
  const isAdmin = await getIsAdmin();

  // Doble verificación: el middleware ya protege esta ruta,
  // pero por si acaso también lo comprobamos aquí.
  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-arena px-4">
      <div className="w-full max-w-sm rounded-3xl border border-surface-border bg-blanco p-8 shadow-lg shadow-piedra/10 text-center">
        <p className="text-3xl">✅</p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          Panel de administración
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Estás conectado como administrador.
          <br />
          Los controles de subir y borrar están activos en la app.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/app"
            className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-tierra px-6 text-base font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95"
          >
            Ir a mis álbumes →
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full border border-surface-border bg-blanco px-6 text-base font-medium text-muted-foreground transition-transform duration-150 hover:border-lust hover:text-lust active:scale-95"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
