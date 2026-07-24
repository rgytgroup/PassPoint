import { useLang } from '../i18n/LangContext';
import { RingGauge } from '../ui/RingGauge';

/**
 * PRUEBA DE FIDELIDAD — Dashboard escritorio+móvil según la referencia PC de
 * Miguel (Master Visual §Parte 2, §8 responsive). Mock visual autocontenido en
 * /proto, fuera del Layout real. Datos de muestra.
 *
 * Correcciones del SPEC respetadas: "Premium" es pago único (§11.5, sin
 * suscripción); "AI Coach" es motor de reglas, no LLM (§11.6); copy honesto
 * (§11.7). Tokens §12.1.
 */

// ── Iconos de línea inline (sin dependencias) ──
const ic = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  bell: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0',
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  book: 'M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z',
  exam: 'M9 4h6a1 1 0 011 1a1 1 0 01-1 1H9a1 1 0 01-1-1a1 1 0 011-1zM6 6h1v14h10V6h1M9 12l2 2 4-4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  coach: 'M12 3v2M8 7h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2zM9 12h.01M15 12h.01M4 12h2M18 12h2',
  chevR: 'M9 6l6 6-6 6',
  chevD: 'M6 9l6 6 6-6',
  pin: 'M12 22c4-5 6-8 6-11a6 6 0 10-12 0c0 3 2 6 6 11zM12 9a2 2 0 100 4 2 2 0 000-4',
  flame: 'M12 2s5 4 5 9a5 5 0 01-10 0c0-1.5 1-3 1-3s1 1.5 2 1.5S12 2 12 2z',
  check: 'M5 12l4 4 8-8',
  clock: 'M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  target: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z',
  checkC: 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-5',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  cal: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  sign: 'M8 3h8l5 5v8l-5 5H8l-5-5V8z',
};

function Line({ d, cls = 'h-6 w-6' }: { d: string; cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function StopSign() {
  return (
    <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden>
      <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z" fill="#EF4444" />
      <text x="12" y="14.5" textAnchor="middle" fill="#fff" style={{ fontSize: 5.2, fontWeight: 800 }}>
        STOP
      </text>
    </svg>
  );
}

const NAV = (es: boolean) => [
  { d: ic.home, label: es ? 'Inicio' : 'Home', active: true },
  { d: ic.book, label: es ? 'Estudiar' : 'Study' },
  { d: ic.exam, label: es ? 'Examen' : 'Exam' },
  { d: ic.chart, label: es ? 'Progreso' : 'Progress' },
  { d: ic.coach, label: 'AI Coach' },
  { d: ic.more, label: es ? 'Más' : 'More' },
];

// Navegación inferior en móvil (5 accesos, sin Premium/Coach para no saturar).
const BOTTOM = (es: boolean) => NAV(es).filter((n) => n.label !== 'AI Coach');

function CardHead({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-text-primary">{title}</h3>
      <span className="text-text-secondary"><Line d={ic.chevR} cls="h-4 w-4" /></span>
    </div>
  );
}

function Metric({ d, value, label }: { d: string; value: string; label: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary"><Line d={d} cls="h-4 w-4" /></span>
      <div>
        <p className="text-sm font-extrabold leading-none text-text-primary">{value}</p>
        <p className="mt-1 text-[11px] leading-tight text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

export function ProtoDashboard() {
  const { lang } = useLang();
  const es = lang === 'ES';

  return (
    <div className="min-h-screen bg-background lg:p-6">
      {/* Contenedor tipo tarjeta (en escritorio) */}
      <div className="mx-auto flex min-h-screen max-w-[1200px] overflow-hidden bg-surface lg:min-h-0 lg:rounded-3xl lg:border lg:border-border lg:shadow-xl">
        {/* ───────────────── Barra lateral (escritorio) ───────────────── */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
          <div className="flex items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-base font-extrabold text-white">P</span>
            <span className="text-lg font-extrabold tracking-tight text-text-primary">PassPoint</span>
          </div>

          <nav className="mt-6 space-y-1">
            {NAV(es).map((n) => (
              <button
                key={n.label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  n.active
                    ? 'border-l-4 border-primary bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-black/5'
                }`}
              >
                <Line d={n.d} cls="h-5 w-5" />
                {n.label}
              </button>
            ))}
          </nav>

          <div className="my-4 border-t border-border" />

          {/* Perfil */}
          <div className="flex items-center gap-3 px-1">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">JD</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary">John Doe</p>
              <button className="text-xs font-semibold text-primary">{es ? 'Ver perfil' : 'View Profile'}</button>
            </div>
          </div>

          {/* Premium (pago único, §11.5) */}
          <div className="mt-4 rounded-2xl bg-primary/5 p-4">
            <span className="text-xl">💎</span>
            <p className="mt-1 text-sm font-bold text-text-primary">{es ? 'Hazte Premium' : 'Go Premium'}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {es ? 'Desbloquea todo con un solo pago.' : 'Unlock everything with one payment.'}
            </p>
            <button className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white">
              {es ? 'Comprar' : 'Get it'}
            </button>
          </div>

          {/* Estado activo */}
          <button className="mt-auto flex items-center gap-3 rounded-xl px-1 pt-4 text-left">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Line d={ic.pin} cls="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold text-text-primary">Florida</p>
              <p className="text-xs font-semibold text-primary">{es ? 'Cambiar estado' : 'Change State'}</p>
            </div>
          </button>
        </aside>

        {/* ───────────────── Contenido principal ───────────────── */}
        <main className="flex min-w-0 flex-1 flex-col bg-background pb-24 lg:pb-0">
          <div className="p-4 lg:p-6">
            {/* Hero redondeado */}
            <div className="relative h-56 overflow-hidden rounded-2xl text-text-on-dark sm:h-60">
              <img src="/heroes/fl.jpg" alt="Florida" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background-dark/85 via-background-dark/45 to-background-dark/10" />
              <div className="relative flex h-full flex-col justify-center px-6">
                {/* Controles arriba a la derecha */}
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/90 text-text-primary">
                    <Line d={ic.bell} cls="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-text-primary lg:hidden">
                    <Line d={ic.menu} cls="h-5 w-5" />
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold sm:text-3xl">
                  {es ? '¡Buenos días, John!' : 'Good morning, John!'}
                </h1>
                <p className="mt-1 text-sm text-text-on-dark/85">
                  {es ? '¿Listo para aprobar tu examen de manejo?' : 'Ready to pass your driving test?'}
                </p>
                <button className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-text-primary">
                  <span className="text-primary"><Line d={ic.pin} cls="h-4 w-4" /></span>
                  Florida
                  <Line d={ic.chevD} cls="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Grilla de tarjetas */}
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {/* Ready Score (2 columnas) */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
                <CardHead title="Ready Score" />
                <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                  <div className="shrink-0 text-center">
                    <RingGauge value={72} size={150} label={es ? 'Listo' : 'Ready'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-extrabold text-text-primary">
                      {es ? '¡Vas muy bien!' : "You're making great progress!"}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {es
                        ? 'Sigue estudiando y estarás listo para el examen real.'
                        : "Keep studying and you'll be ready for the real test."}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Metric d={ic.book} value="40" label={es ? 'Temas vistos' : 'Topics Studied'} />
                      <Metric d={ic.checkC} value="320" label={es ? 'Preguntas' : 'Questions Answered'} />
                      <Metric d={ic.target} value="85%" label={es ? 'Promedio' : 'Avg. Score'} />
                      <Metric d={ic.clock} value="12h" label={es ? 'Tiempo' : 'Study Time'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Streak */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <CardHead title={es ? 'Racha de estudio' : 'Study Streak'} />
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl">🔥</span>
                  <p className="text-3xl font-extrabold text-text-primary">
                    7 <span className="text-lg font-semibold text-text-secondary">{es ? 'días' : 'Days'}</span>
                  </p>
                </div>
                <div className="mt-4 flex justify-between">
                  {(es ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                          i < 5 ? 'bg-primary text-white' : 'border border-border text-text-secondary'
                        }`}
                      >
                        {i < 5 ? <Line d={ic.check} cls="h-4 w-4" /> : ''}
                      </span>
                      <span className="text-[10px] text-text-secondary">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Goal */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="font-bold text-text-primary">{es ? 'Meta de hoy' : "Today's Goal"}</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {es ? 'Completa 20 preguntas' : 'Complete 20 questions'}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary" style={{ width: '70%' }} />
                  </div>
                  <span className="text-sm font-bold text-text-primary">14/20</span>
                </div>
                <button className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                  {es ? 'Seguir estudiando' : 'Continue Studying'}
                </button>
              </div>

              {/* Continue Learning */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="font-bold text-text-primary">{es ? 'Continúa aprendiendo' : 'Continue Learning'}</h3>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{es ? 'Señales' : 'Road Signs'}</p>
                    <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-primary" style={{ width: '65%' }} />
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">65% {es ? 'completado' : 'Completed'}</p>
                  </div>
                  <StopSign />
                </div>
                <button className="mt-4 w-full rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5">
                  {es ? 'Reanudar' : 'Resume'}
                </button>
              </div>

              {/* AI Coach (motor de reglas, §11.6) */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold text-primary">AI Coach</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {es ? 'Recibe consejos personalizados y mejora más rápido.' : 'Get personalized tips and improve faster.'}
                    </p>
                  </div>
                  <span className="text-4xl">🤖</span>
                </div>
                <button className="mt-4 w-full rounded-xl border border-primary bg-surface px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5">
                  {es ? 'Preguntar al Coach' : 'Ask Coach'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <h2 className="mt-6 text-lg font-bold text-text-primary">{es ? 'Acciones rápidas' : 'Quick Actions'}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { d: ic.list, label: es ? 'Practicar' : 'Practice Questions' },
                { d: ic.cal, label: es ? 'Simulacro' : 'Mock Exam' },
                { d: ic.target, label: es ? 'Repasar fallos' : 'Review Mistakes' },
                { d: ic.sign, label: es ? 'Señales' : 'Road Signs' },
              ].map((q) => (
                <button
                  key={q.label}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5 text-left shadow-sm transition hover:border-primary"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Line d={q.d} cls="h-5 w-5" /></span>
                    <span className="text-sm font-semibold text-text-primary">{q.label}</span>
                  </span>
                  <span className="text-text-secondary"><Line d={ic.chevR} cls="h-4 w-4" /></span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación inferior (móvil/tablet) */}
          <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center border-t border-border bg-surface/95 px-2 py-2 backdrop-blur lg:hidden">
            {BOTTOM(es).map((n) => (
              <button
                key={n.label}
                className={`flex flex-1 flex-col items-center gap-1 py-1 ${n.active ? 'text-primary' : 'text-text-secondary'}`}
              >
                <Line d={n.d} cls="h-6 w-6" />
                <span className="text-[10px] font-semibold">{n.label}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
