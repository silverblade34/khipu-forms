# 🚀 Cómo correr Khipu Forms

## Variables de entorno necesarias

Crea/edita `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=tu-secreto-jwt-aqui
```

## Correr en desarrollo

```bash
cd khipu-forms
npm install
npm run dev
```

Abre http://localhost:3000

## ⚠️ Importante: Google OAuth Callback URL

Debes agregar `http://localhost:3000/api/auth/callback/google` como URL de redirect autorizada en Google Cloud Console en el mismo proyecto OAuth donde está la app qhatupe.

---

## Estructura del proyecto

```
khipu-forms/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login con Google
│   ├── dashboard/            # Dashboard del usuario
│   ├── builder/[id]/         # Constructor de formularios
│   ├── f/[id]/               # Formulario público
│   ├── responses/[id]/       # Panel de respuestas
│   └── api/
│       ├── auth/             # Google OAuth + session
│       ├── forms/            # CRUD de formularios
│       └── public/forms/     # API pública para submit
├── lib/
│   ├── db.ts                 # Pool de PostgreSQL
│   ├── actions.ts            # Server actions (CRUD)
│   ├── session.ts            # JWT session management
│   ├── types.ts              # TypeScript types
│   └── validations.ts        # Schemas Zod
├── store/
│   └── builderStore.ts       # Zustand store del builder
├── proxy.ts                  # Route protection (Next.js 16)
└── schema.sql                # SQL completo de la BD
```

## Flujo de usuario

1. Ir a `/` → landing page
2. Clic en "Iniciar sesión" → `/login`
3. Clic en "Continuar con Google" → OAuth flow
4. Redirect a `/dashboard` → lista de formularios
5. "Nuevo formulario" → `/builder/[id]`
6. Agregar campos, editar, auto-guardar
7. "Compartir" → copiar link `/f/[id]`
8. Cualquier persona llena el formulario público
9. Ver respuestas en `/responses/[id]`
10. Exportar CSV

## Base de datos (tablas creadas)

- `users` — usuarios autenticados con Google
- `forms` — formularios creados
- `form_fields` — campos de cada formulario
- `responses` — respuestas enviadas
- `response_answers` — respuestas por campo
