# CLAUDE.md — PassPoint

Instrucciones permanentes para Claude Code en este repositorio. Léelas al inicio de cada sesión.

## Antes de cualquier tarea
1. Lee `SPEC.md` completo. Es el contrato del producto.
2. Respeta sin excepción: el stack (SPEC §2), los guardrails (SPEC §8) y el fuera de alcance (SPEC §10). Si una tarea parece requerir violar alguno, DETENTE y pregunta al dueño en lugar de improvisar.

## Regla de oro del contenido (la más importante del proyecto)
- Solo preguntas con status `HUMAN_APPROVED` se sirven a usuarios. Sin excepciones, ni "temporalmente", ni para demos públicas.
- Toda pregunta generada debe anclarse a un fragmento (`manualRef`) del manual oficial del estado. Preguntas sin fuente = rechazadas.
- PROHIBIDO copiar preguntas de otras apps o de bancos licenciados de terceros. Las preguntas son siempre redacción original basada en el manual oficial.
- El español es latinoamericano natural, no traducción literal. El revisor humano tiene la última palabra sobre el tono.

## Reglas de trabajo
- Los prompts del pipeline viven en `/content-factory/prompts/*.md`, versionados en git. Nunca hardcodeados.
- La fábrica de contenido (`/content-factory`) son scripts CLI independientes del runtime del producto. El producto NO llama IA en runtime.
- Secretos SOLO en variables de entorno (ver `.env.example`). Nunca en código, commits ni logs.
- Webhooks de Stripe idempotentes: un evento repetido no puede duplicar entitlements ni emails.
- Las páginas públicas/SEO se generan como SSG e indexables; no convertirlas en client-side rendering.
- Commits pequeños y descriptivos en español.

## Estilo técnico
- TypeScript estricto en front y back.
- NestJS: módulos por dominio (states, questions, attempts, entitlements, content-factory).
- Prisma como única capa de acceso a datos.
- PWA: el banco comprado debe funcionar offline (service worker + IndexedDB) y sincronizar intentos al reconectar.

## Qué NO hacer aunque parezca buena idea
- No agregar suscripciones, anuncios ni timers falsos (compra única de por vida es el modelo).
- No construir app nativa, vertical de ciudadanía, más de 2 idiomas, gamificación social ni panel admin elaborado (SPEC §10).
- No inventar precisión en la "probabilidad de aprobar": redondear a múltiplos de 5 y usar la heurística del SPEC §5.

## Definición de terminado
Una tarea está terminada cuando cumple su criterio de aceptación (SPEC §9 cuando aplique), compila sin warnings de TypeScript, y el flujo afectado se probó end-to-end en local.
