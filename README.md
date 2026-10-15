# Reservas Pista de Tenis

Aplicación web para gestionar las reservas públicas y gratuitas de una pista de tenis municipal.

> **Estado actual: Fase 2 — Supabase, modelo de datos y seguridad.** Ya existe el esquema de base de datos y las políticas de seguridad (RLS), pero todavía no hay pantallas de reserva ni de administración conectadas (eso es la Fase 3).

## Descripción

- **Área pública**: consulta de horarios disponibles y reserva sin necesidad de crear una cuenta (nombre y contacto), limitada a los próximos siete días, con cancelación mediante enlace seguro por correo.
- **Área de administración**: acceso protegido para gestionar horarios semanales, duración de turnos, excepciones, bloqueos y reservas.
- Interfaz en español, zona horaria `Europe/Madrid`, adaptable a móvil y escritorio.

## Arquitectura

- [Next.js](https://nextjs.org/) con App Router
- TypeScript en modo estricto
- React
- Supabase (autenticación y PostgreSQL)
- Vercel para el despliegue — no configurado todavía

## Requisitos

- Node.js 20 o superior
- npm 9 o superior
- Git

Comprueba tus versiones instaladas:

```bash
node --version
npm --version
git --version
```

## Instalación

```bash
npm install
```

## Comandos de desarrollo

```bash
npm run dev     # servidor de desarrollo en http://localhost:3000
npm run lint    # comprobación de estilo y errores con ESLint
npm run build   # compilación de producción
npm run start   # servidor de producción (tras compilar)
```

## Estructura del proyecto

```
src/
  app/
    layout.tsx        # layout raíz de la aplicación
    page.tsx           # página de inicio
    globals.css        # estilos globales
    reservar/           # sección pública de reservas (en construcción)
    admin/               # sección de administración (en construcción)
  lib/
    supabase/
      client.ts         # cliente de Supabase para Client Components
      server.ts          # cliente de Supabase para Server Components / Actions
      middleware.ts        # refresco de sesión de Supabase Auth
middleware.ts                # engancha el refresco de sesión a cada petición
supabase/
  config.toml                # configuración del proyecto Supabase (CLI)
  migrations/                 # historial de cambios del esquema SQL
public/                   # recursos estáticos
```

La carpeta `src/components/` se añadirá cuando existan componentes de interfaz reutilizables entre la parte pública y la de administración (Fase 3).

## Ejecutar el proyecto en local

1. Instala las dependencias: `npm install`
2. Copia `.env.local.example` a `.env.local` y rellena las credenciales de tu proyecto de Supabase (ver sección siguiente)
3. Arranca el servidor de desarrollo: `npm run dev`
4. Abre [http://localhost:3000](http://localhost:3000) en el navegador

## Configurar Supabase

Este proyecto necesita un proyecto de [Supabase](https://supabase.com) (capa gratuita suficiente para empezar).

1. Crea una cuenta en [supabase.com](https://supabase.com) si no tienes una, y pulsa **"New Project"**.
2. Elige un nombre (p. ej. `reservatenis`), una contraseña segura para la base de datos (guárdala en un gestor de contraseñas) y una región cercana a España, por ejemplo **"EU West (Ireland/London)"** o la más próxima disponible.
3. Cuando el proyecto esté listo, ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**
4. En la carpeta del proyecto, copia `.env.local.example` a `.env.local` y pega esos dos valores. **No compartas ni pegues esas claves en un chat**: `.env.local` nunca se sube a git (está en `.gitignore`).
5. Aplica el esquema de base de datos (tablas, restricciones y seguridad) de una de estas dos formas:
   - **Opción A — panel web**: abre el **SQL Editor** del proyecto en supabase.com y pega el contenido de [`supabase/migrations/20261014141136_esquema_inicial.sql`](supabase/migrations/20261014141136_esquema_inicial.sql), luego ejecútalo.
   - **Opción B — CLI**: `npx supabase link --project-ref TU_REF_DE_PROYECTO` (pide iniciar sesión en tu navegador) y después `npx supabase db push`.
6. Para el panel de administración, crea un usuario en **Authentication → Users → Add user** con tu correo y una contraseña — será quien pueda iniciar sesión en `/admin` (la autenticación todavía no está conectada en la interfaz, eso es la Fase 3).

### Modelo de datos

| Tabla | Para qué sirve |
| --- | --- |
| `configuracion` | Fila única con la duración de los turnos y el plazo límite de cancelación |
| `horario_semanal` | Franjas de apertura recurrentes por día de la semana |
| `excepciones_fecha` | Cierres o horarios especiales para una fecha concreta |
| `bloqueos` | Bloqueos puntuales de horario o de jornada completa (p. ej. mantenimiento) |
| `reservas` | Turnos reservados, con token de cancelación propio (no es el id de la reserva) |

Seguridad (RLS, Row Level Security):

- Cualquiera puede **leer** horarios, excepciones, bloqueos y configuración (para calcular la disponibilidad), y **crear** una reserva.
- Nadie puede leer los datos personales (nombre/contacto) de las reservas de otras personas: la disponibilidad pública se consulta a través de la vista `reservas_disponibilidad`, que no expone esos datos.
- La cancelación de una reserva se hace mediante la función `cancelar_reserva(token)`, que valida el token y el plazo límite — no existe forma de cancelar o modificar una reserva ajena directamente.
- Una restricción de base de datos (`reservas_sin_solape`) impide que dos reservas confirmadas se solapen en el tiempo, ya que solo hay una pista.
- La gestión completa (crear horarios, bloqueos, excepciones, ver y cancelar cualquier reserva) requiere estar autenticado — eso corresponde al panel de administración.

## Próximos pasos (Fase 3)

- Construir la interfaz pública de reserva: calcular los huecos disponibles de los próximos 7 días a partir de `horario_semanal`, `excepciones_fecha`, `bloqueos` y `reservas_disponibilidad`, y el formulario de reserva.
- Enviar el correo de confirmación con el enlace de cancelación (`/cancelar/[token]`).
- Construir el panel de administración: inicio de sesión con Supabase Auth y pantallas para gestionar horarios, excepciones, bloqueos, configuración y reservas.
- Avisos cuando un cambio de horario afecte a reservas ya existentes.
