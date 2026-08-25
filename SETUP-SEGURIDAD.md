# Album NFC — Versión privada con autenticación

Basado en [marcasanova/webapp-nfc](https://github.com/marcasanova/webapp-nfc).  
Esta versión añade **autenticación de dueño**: solo tú puedes subir y borrar fotos.  
Los visitantes (quien escanee tu pegatina NFC) pueden **ver** los álbumes pero no tocarlos.

---

## ¿Qué cambia respecto al original?

| Funcionalidad | Original (MVP) | Esta versión |
|---|---|---|
| Ver álbumes y fotos | ✅ Todos | ✅ Todos |
| Crear álbum | ✅ Todos | 🔒 Solo el dueño |
| Subir fotos | ✅ Todos | 🔒 Solo el dueño |
| Borrar fotos | ✅ Todos | 🔒 Solo el dueño |
| Borrar álbum | ✅ Todos | 🔒 Solo el dueño |
| Cambiar portada | ✅ Todos | 🔒 Solo el dueño |

La protección actúa en **tres capas**:
1. **RLS en Supabase** — las políticas de base de datos rechazan escrituras de `anon`
2. **Middleware de Next.js** — protege la ruta `/admin`
3. **Server Actions** — cada acción de escritura verifica la sesión antes de ejecutarse

---

## Instalación paso a paso

### 1. Clonar y fusionar con el original

```bash
# Clonar el repo original
git clone https://github.com/marcasanova/webapp-nfc webapp-nfc-private
cd webapp-nfc-private

# Copiar los archivos de seguridad de este directorio encima del clone
# (todos los ficheros de esta carpeta reemplazan o complementan a los originales)
```

Archivos que aporta esta versión (copiar sobre el clone):

```
middleware.ts                         ← NUEVO
lib/auth.ts                           ← NUEVO
lib/supabase/client.ts                ← NUEVO (el original puede no incluirlo)
app/actions/auth.ts                   ← NUEVO
app/actions/albums.ts                 ← REEMPLAZA al original
app/actions/media.ts                  ← REEMPLAZA al original
app/admin/login/page.tsx              ← NUEVO
app/admin/page.tsx                    ← NUEVO
app/app/page.tsx                      ← REEMPLAZA al original
app/album/[slug]/page.tsx             ← REEMPLAZA al original
components/photo-grid.tsx             ← REEMPLAZA al original
components/photo-lightbox.tsx         ← REEMPLAZA al original
supabase/migrations/002_secure_rls.sql ← NUEVA migración
.env.example                          ← igual que el original
```

### 2. Configurar Supabase

```bash
npm install
cp .env.example .env.local
```

Rellena `.env.local` con tu **Project URL** y **anon key** de  
Supabase → Project Settings → API.

### 3. Ejecutar las migraciones SQL

En **Supabase Dashboard → SQL Editor** ejecuta en orden:

1. `supabase/migrations/001_albums_and_media.sql` (del repo original — crea las tablas)
2. `supabase/migrations/002_secure_rls.sql` ← **esta migración** (endurece las políticas RLS)

### 4. Activar Supabase Auth y crear tu usuario

1. En Supabase Dashboard → **Authentication → Providers** → asegúrate de que **Email** está activado.
2. Ve a **Authentication → Users → Add user** e introduce tu email y contraseña.

> ⚠️ No compartas estas credenciales. Son solo tuyas.

### 5. Arrancar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Uso en producción

### Iniciar sesión como dueño

Navega a `https://tu-dominio.com/admin/login` e introduce tus credenciales.  
Una vez autenticado, volverás a `/app` y verás los controles de subir / borrar.

### Cerrar sesión

Ve a `https://tu-dominio.com/admin` y pulsa **Cerrar sesión**.

### Lo que ve un visitante

Un visitante que escanee la pegatina NFC llega a `/` o `/app`:
- Ve todos los álbumes y puede navegar por las fotos
- **No** ve el botón «Nuevo álbum», «Subir foto» ni «Borrar»
- **No** puede borrar nada aunque intente llamar a las rutas directamente  
  (las Server Actions rechazan la petición y Supabase RLS la bloquea a nivel de base de datos)

---

## Arquitectura de seguridad

```
Visitante anon                          Tú (dueño autenticado)
─────────────                           ──────────────────────
GET /app         → ✅ ve álbumes         GET /app         → ✅ ve álbumes
GET /album/[s]   → ✅ ve fotos           GET /album/[s]   → ✅ ve fotos + controles
POST createAlbum → ❌ 401 en action      POST createAlbum → ✅ se crea
POST deleteAlbum → ❌ 401 en action      POST deleteAlbum → ✅ se borra
Storage INSERT   → ❌ RLS bloquea        Storage INSERT   → ✅ OK (authenticated)
Storage DELETE   → ❌ RLS bloquea        Storage DELETE   → ✅ OK (authenticated)
GET /admin       → ↩ redirige a login   GET /admin       → ✅ panel de admin
```

---

## Despliegue en Vercel

```bash
vercel --prod
```

Añade las variables de entorno en Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Licencia

MIT — mismo que el proyecto original.
