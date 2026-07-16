# PassPoint

Preparación para el examen teórico del DMV (USA) en español e inglés: práctica por tema, simulacros con formato real, señales de tránsito y probabilidad de aprobar. Freemium con compra única por estado. PWA con soporte offline.

Producto de **rgytgroup**. App independiente, no afiliada a ningún DMV ni entidad gubernamental.

## Documentos clave
- `SPEC.md` — especificación técnica completa (stack, modelo de datos, páginas, fábrica de contenido, guardrails, criterios de aceptación). **Leer antes de tocar código.**
- `CLAUDE.md` — reglas de trabajo para sesiones con Claude Code, incluida la regla de oro del contenido.
- `.env.example` — variables de entorno requeridas (los valores reales nunca van al repo).

## Stack
React + Vite + Tailwind PWA (Vercel) · NestJS + Prisma (Railway) · Supabase · Stripe · Resend · Gemini (solo fábrica de contenido)

## Cómo trabajar en este repo
1. Copiar `.env.example` a `.env` y llenar valores (pedir acceso al gestor de secretos).
2. Abrir Claude Code en la raíz: leerá `CLAUDE.md` automáticamente.
3. Pedir tareas referenciando el plan de ejecución y el SPEC, por ejemplo:
   `"Genera el esqueleto del proyecto según SPEC §2 y §3 (semana 1, tarea 1.2)."`

## Estado
🚧 En construcción — fase MVP (plan de ejecución de 8 semanas). Primer estado: California.
