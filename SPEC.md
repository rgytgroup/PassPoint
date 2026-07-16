# SPEC.md — PassPoint
> Especificación técnica para Claude Code. Ponla en la raíz del repo. Complementa (no reemplaza) el plan de ejecución semanal.

## 1. Qué es
PWA de preparación para el examen teórico del DMV en USA, bilingüe español/inglés, freemium con compra única por estado (o all-access). El contenido (bancos de preguntas) se produce con un pipeline de IA + validación humana y es el activo central del negocio.

## 2. Stack (no cambiar sin decisión explícita del dueño)
- Frontend: React 18 + Vite + Tailwind, PWA (instalable, offline para contenido comprado). Deploy: Vercel.
- Backend: NestJS + Prisma. Deploy: Railway.
- DB/Auth: Supabase (Postgres, magic link por email).
- Pagos: Stripe Checkout + webhooks.
- Email: Resend.
- IA: solo en el pipeline de contenido (scripts en `/content-factory`), NO en runtime del producto.
- SEO: páginas públicas pre-renderizadas (SSG) — decisión clave: las rutas públicas deben ser indexables y rápidas.

## 3. Modelo de datos (Prisma)
- `State`: id, code (CA, TX...), nameEn, nameEs, examQuestionCount, passThreshold, manualVersion, manualUrl, active.
- `Topic`: id, stateId, slug, nameEn, nameEs, order.
- `Question`: id, topicId, textEn, textEs, options (Json: [{textEn, textEs, correct}]), explanationEn, explanationEs, manualRef (sección del manual), difficulty (1–3), status (DRAFT|AI_VERIFIED|HUMAN_APPROVED), version.
  - **Regla dura: solo status HUMAN_APPROVED se sirve a usuarios.**
- `User`: id, email, preferredLang, createdAt.
- `Entitlement`: id, userId, scope (STATE|ALL), stateId?, stripeSessionId, createdAt.
- `Attempt`: id, userId, stateId, mode (PRACTICE|MOCK), answers (Json), score, passed, createdAt.
- `UserQuestionStat`: userId, questionId, timesSeen, timesWrong, lastSeenAt — alimenta repaso de falladas y readiness.
- `Event`: analítica interna mínima.

## 4. Páginas
1. `/` Home: selector de estado, propuesta bilingüe, prueba social.
2. `/[state]` Hub del estado: temas, progreso, "Probabilidad de aprobar", CTA de compra.
3. `/[state]/practica/[topic]` Práctica por tema: pregunta → respuesta → explicación + referencia al manual; toggle ES⇄EN instantáneo por pregunta.
4. `/[state]/simulacro` Mock cronometrado con examQuestionCount y passThreshold reales del estado; resultados con desglose por tema.
5. `/[state]/senales` Módulo visual de señales de tránsito.
6. `/repaso` Falladas del usuario (cross-tema).
7. `/precios` + Stripe Checkout ($12.99 estado / $19.99 all-access).
8. **SEO (SSG, públicas):** `/[state]/examen-de-manejo-espanol`, `/[state]/preguntas/[topic]`, `/[state]/faq/[slug]` — ~15 por estado, con test gratis embebido de 5 preguntas como imán.
9. Legal: `/terminos`, `/privacidad`, `/reembolsos`.

## 5. Lógica freemium y readiness
- Gratis: 50 preguntas fijas por estado (flag `isFree` en Question) + 1 simulacro corto.
- Paywall: al agotar gratis → pantalla de compra con progreso visible ("Ya dominas 3 temas — desbloquea los 15").
- "Probabilidad de aprobar": heurística v1 = ponderar % aciertos recientes por tema × cobertura del banco; mostrar como % con mensaje motivacional. No inventar precisión — redondear a múltiplos de 5.
- Offline: al comprar, cachear el banco del estado (service worker + IndexedDB); intentos offline se sincronizan al volver.

## 6. Fábrica de contenido (`/content-factory`, scripts CLI — el corazón)
Pipeline por estado, ejecutado por el operador con Claude Code:
1. `ingest`: descargar/parsear el manual oficial del estado (PDF, EN y ES si existe) → chunks con referencia de sección.
2. `generate`: producir preguntas por tema con plantilla estricta; **cada pregunta debe citar el chunk del manual que la sustenta**; salida a DRAFT.
3. `verify`: segundo pase de IA que valida cada DRAFT contra su chunk fuente (respuesta correcta única, opciones plausibles, español natural); pasa a AI_VERIFIED o marca `flags`.
4. `review`: CLI interactivo para revisión humana 1×1 (aprobar/editar/rechazar) → HUMAN_APPROVED. **Sin excepciones: el 100% pasa por ojos humanos.**
5. `import`: carga a DB con versión.
6. `watch`: cron que verifica hash/fecha del manual oficial; si cambió → alerta para regenerar temas afectados.
- Plantillas y prompts en `/content-factory/prompts/*.md`, versionadas en git.
- Meta operativa: ≤12 h humanas por estado bilingüe.

## 7. Variables de entorno
`DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, APP_BASE_URL`

## 8. Reglas de negocio y guardrails
- Compra única de por vida. PROHIBIDO: suscripciones, anuncios, timers falsos.
- Contenido: preguntas SIEMPRE originales redactadas desde el manual oficial. PROHIBIDO copiar preguntas de otras apps o bancos licenciados (p. ej. material DVSA/terceros).
- Disclaimer visible: app independiente, no afiliada a ningún DMV ni entidad gubernamental.
- Español natural latinoamericano, no traducción literal; el revisor humano es la autoridad final del tono.
- Bug de contenido reportado por usuario → corrección en <24 h + auditoría del tema completo (proceso, no promesa).
- Estados v1 (en orden): CA, TX, FL, NY, AZ, IL, NJ, GA.

## 9. Criterios de aceptación del MVP (definition of done)
- [ ] California completo: ~300 preguntas HUMAN_APPROVED bilingües con manualRef.
- [ ] Práctica, simulacro con formato real, señales, repaso de falladas y readiness funcionando.
- [ ] Freemium + Stripe + entitlement por estado y all-access, webhook idempotente.
- [ ] Toggle ES⇄EN instantáneo sin recarga.
- [ ] Offline: banco comprado usable sin red; sincronización al reconectar.
- [ ] 15 páginas SEO de CA en SSG, sitemap, indexables (verificado en Search Console).
- [ ] Lighthouse móvil ≥ 90 en páginas públicas.
- [ ] Pipeline de fábrica corre de punta a punta para un estado nuevo sin tocar código.

## 10. Fuera de alcance v1 (NO construir aunque sea tentador)
App nativa, hazard perception/videos, vertical de ciudadanía, más de 2 idiomas, gamificación social/leaderboards, panel admin elaborado (el CLI de review basta).
