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

## 11. Funcionalidades rescatadas del Prototipo v1.0 (papá) — con correcciones al modelo original

El prototipo v1.0 aportó mecánicas excelentes que se ADOPTAN, y tres desviaciones del modelo de negocio que se CORRIGEN. Esta sección es el contrato resultante.

### 11.1 ✅ Smart Study (SIN IA en runtime — regla de oro intacta)
- "Enfócate hoy en lo que fallas": recomendaciones de estudio calculadas desde `UserQuestionStat` (preguntas falladas, veces vistas, temas débiles). **Es matemática sobre estadísticas propias — CERO llamadas a LLM.**
- Incluye: temas débiles priorizados con su % de dominio, "Plan de hoy" (N preguntas, tiempo estimado, impacto estimado en el Ready Score), y el modo "Smart Study" que arma la sesión con las preguntas más falladas + no vistas del tema débil.
- El copy puede llamarlo "recomendación inteligente" — la implementación es un motor de reglas, no un modelo.

### 11.2 ✅ Ready Score (con honestidad de precisión)
- Score de preparación prominente en el dashboard ("Estás al 85% de listo") + dominio por tema.
- REGLA (ya existente, se reafirma): redondear a múltiplos de 5. PROHIBIDO fingir precisión ("91%", "solo te falta 6%") — la heurística no da para decimales de confianza.

### 11.3 ✅ Gamificación LIGERA (sin social)
- SE ADOPTAN: racha de días (streak), logros simples (primera racha de 5, primer simulacro aprobado, 90%+ en un tema), reto diario ("supera tu puntaje de ayer"), notificación de racha en riesgo.
- SIGUEN FUERA (SPEC §10): leaderboards, comparación social, y cualquier mecánica que requiera cuentas sociales.

### 11.4 ✅ Otros rescates
- Notificaciones push de la PWA (recordatorio de estudio y racha) — opt-in, configurables.
- Pantalla de resultados celebratoria del simulacro (confeti + desglose correcto/incorrecto + revisar respuestas).
- Selector multi-estado con estados "coming soon" visibles (aspiración honesta: solo se listan como disponibles los que EXISTEN con banco HUMAN_APPROVED).

### 11.5 ❌ CORRECCIÓN 1 — El modelo es PAGO ÚNICO, no suscripción
- El documento maestro v1.0 proponía "subscription-based business model with recurring revenue" (BO-002). **SE RECHAZA.** Origen identificado: default de la industria inyectado por la herramienta de generación — igual que los testimonios falsos en mockups. Se poda, no se adopta.
- El modelo vigente e innegociable: **compra única de por vida** — $12.99/estado o $19.99 all-access. Es EL diferenciador contra competidores de $6.99/semana, encaja con un producto que se usa ~3 semanas, y evita la maquinaria de churn/renovaciones que un equipo de dos no puede operar.
- PROHIBIDO en producto y copy: "plan", "renovación", "suscripción", métricas de churn/retención de pago. El mensaje canónico de la pantalla de pago: **"Un solo pago. Tuyo para siempre."**

### 11.6 ❌ CORRECCIÓN 2 — El "AI Coach" v1 es un motor de reglas, no un chat con LLM
- La regla de oro económica de PassPoint se reafirma: **la IA es la fábrica (genera el banco una vez), nunca el motor (cero costo por usuario en runtime).** Margen ~95% depende de esto.
- El "coach" v1 = §11.1 (Smart Study por estadísticas) + mensajes plantillados según el estado del usuario ("Llevas 12 días de racha", "Parking sigue siendo tu tema débil — ¿lo repasamos?"). Todo determinístico, cero API.
- Un chat de coach con LLM real queda en BACKLOG como experimento futuro, con tres condiciones: límites duros de uso por usuario, solo para tier pagado, y solo si los números demuestran que se paga solo. No es parte de v1 ni v2.

### 11.7 ❌ CORRECCIÓN 3 — Copy honesto sobre las preguntas
- PROHIBIDO: "Official questions", "Real DMV questions", "preguntas oficiales" o cualquier afirmación de que el banco contiene las preguntas del examen real.
- Copy canónico permitido: **"Preguntas al estilo del examen real, basadas en el manual oficial de tu estado"** / "Exam-style questions based on your state's official driver handbook."
- Se reafirma el disclaimer de no afiliación (§8) visible en la app y la landing.

## 12. Dirección visual v2 (prototipo) — cómo se adopta
- El prototipo v1.0 se adopta como dirección visual v2: dashboard con Ready Score, tarjetas de dominio por tema, pantallas de estudio/simulacro/resultados, perfil y configuración.
- Se construye EN DEV (misma disciplina que Truly): producción sigue con la versión estable; el v2 se prueba con calma y se promueve cuando pase criterios.
- Sistema de diseño: tokens formalizados en §12.1 (documento oficial "PassPoint Color Palette v1.0"). Método: primitivos → tokens semánticos → variables CSS; componentes NUNCA con hex hardcodeados. Jerarquía de fuentes de verdad: (1) SPEC para funcionalidad, (2) Prototipo para UX/UI y layouts, (3) Paleta oficial §12.1 para todo color. Ante discrepancia visual entre prototipo y paleta: se mantiene la apariencia del prototipo usando los tokens documentados. No se rediseña ni se introduce identidad nueva.

### 12.1 Tokens oficiales de color (contrato — documento del papá, adoptado)
| Token | HEX | Uso |
|---|---|---|
| `primary` | `#5B5EF7` | Botones primarios, navegación, CTAs — color de marca dominante |
| `primary-dark` | `#4749E8` | Hover / Active |
| `secondary` | `#7C3AED` | Acentos y highlights secundarios |
| `success` | `#16C784` | SOLO respuestas correctas y progreso positivo |
| `warning` | `#F5B82E` | SOLO advertencias y rachas |
| `error` | `#EF4444` | SOLO errores y validación fallida |
| `background-dark` | `#091325` | Pantallas oscuras inmersivas |
| `surface` | `#FFFFFF` | Cards y contenido (modo claro — el dominante) |
| `card-dark` | `#1B2435` | Paneles en modo oscuro |
| `border` | `#E5E7EB` | Bordes y separadores claros |
| `text-primary` | `#111827` | Títulos |
| `text-secondary` | `#6B7280` | Descripciones |
| `text-on-dark` | `#F9FAFB` | Texto sobre fondos oscuros |

Reglas de aplicación (del documento oficial + coherencia con §11):
- Primary `#5B5EF7` domina la marca; cards blancas sobre fondos claros; el fondo oscuro se reserva para pantallas inmersivas (hero/onboarding/resultados).
- Success/Warning/Error se RESERVAN para feedback del usuario — nunca decorativos (misma disciplina semántica que Truly).
- Nota de accesibilidad a verificar en implementación: contraste de `warning #F5B82E` y `success #16C784` como TEXTO sobre blanco es límite — usarlos sobre fondos translúcidos de su propio color (badge style) o en versión oscurecida cuando sean texto pequeño.
- Gap conocido para completar en una revisión futura del design system (no bloquea): tokens de tipografía con escala formal, radios y espaciado — mientras tanto, el prototipo es la referencia visual y se respeta la escala de 8px como default del estudio.
- Prioridad declarada: **el rediseño NUNCA desplaza al camino crítico — el banco de California HUMAN_APPROVED y las páginas SEO siguen siendo lo primero.** El v2 avanza con el tiempo que sobre.

## 13. Criterios de aceptación de los rescates
- [ ] Smart Study funciona sin ninguna llamada a IA en runtime (verificable: cero requests a APIs de LLM durante el uso normal de la app).
- [ ] Ready Score y todos los porcentajes de confianza redondeados a múltiplos de 5.
- [ ] Racha, logros y reto diario funcionando sin componente social.
- [ ] Cero aparición de "suscripción/plan/renovación" en producto, checkout y copy; pantalla de pago con "Un solo pago. Tuyo para siempre."
- [ ] Cero afirmaciones de "preguntas oficiales/reales del DMV" en app, landing y tiendas; copy canónico de §11.7 aplicado.
- [ ] Estados listados como disponibles = solo los que tienen banco HUMAN_APPROVED completo.
- [ ] El v2 visual vive en dev y producción permanece estable hasta pasar criterios.