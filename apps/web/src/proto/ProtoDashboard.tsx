import { useLang } from '../i18n/LangContext';
import { RingGauge } from '../ui/RingGauge';

/**
 * PRUEBA DE FIDELIDAD (1 pantalla): clon del Dashboard del prototipo v1.0
 * (Master Visual §Parte 2). Mock visual mobile-first, autocontenido, con datos
 * de muestra que replican la imagen. Ruta /proto, fuera del Layout real.
 *
 * Respeta las correcciones del SPEC: copy honesto (§11.7), pago único (§11.5),
 * coach por reglas (§11.6). Tokens §12.1, cero hex hardcodeado salvo overlays.
 */

// ── Iconos de línea (inline, sin dependencias) ──
const ic = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  bell: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0',
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  book: 'M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z',
  exam: 'M9 4h6a1 1 0 011 1v0a1 1 0 01-1 1H9a1 1 0 01-1-1v0a1 1 0 011-1zM6 6h1v14h10V6h1M9 12l2 2 4-4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  chevron: 'M6 9l6 6 6-6',
  flame: 'M12 2s5 4 5 9a5 5 0 01-10 0c0-1.5 1-3 1-3s1 1.5 2 1.5S12 2 12 2z',
};

function Line({ d, cls = 'h-6 w-6' }: { d: string; cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function NavItem({ d, label, active }: { d: string; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-1 flex-col items-center gap-1 py-1 ${active ? 'text-primary' : 'text-text-secondary'}`}>
      <Line d={d} cls="h-6 w-6" />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

export function ProtoDashboard() {
  const { lang } = useLang();
  const es = lang === 'ES';

  return (
    <div className="flex min-h-screen justify-center bg-slate-200 py-0 sm:py-8">
      {/* Marco tipo teléfono */}
      <div className="relative flex w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-2xl sm:rounded-[2.5rem]">
        {/* ── Hero con foto del estado + overlay ── */}
        <div className="relative h-72 shrink-0 text-text-on-dark">
          <img src="/heroes/ca.jpg" alt="California" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/70 via-background-dark/40 to-background-dark/85" />
          <div className="relative flex h-full flex-col px-5 pt-5">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Line d={ic.menu} cls="h-6 w-6" />
                <span className="text-sm font-extrabold tracking-widest">PASSPOINT</span>
              </div>
              <div className="relative">
                <Line d={ic.bell} cls="h-6 w-6" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warning" />
              </div>
            </div>

            {/* Saludo */}
            <div className="mt-auto">
              <p className="text-sm text-text-on-dark/80">
                {es ? 'Buenos días,' : 'Good morning,'}
              </p>
              <h1 className="text-2xl font-extrabold">Michael 👋</h1>
              <p className="mt-1 text-sm text-text-on-dark/80">
                {es ? 'Estás cada vez más cerca de tu licencia.' : "You're getting closer to your license."}
              </p>
              {/* Selector de estado */}
              <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-white">P</span>
                California
                <Line d={ic.chevron} cls="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Contenido (hoja redondeada que sube sobre el hero) ── */}
        <div className="relative -mt-6 flex-1 space-y-4 rounded-t-3xl bg-background px-4 pb-28 pt-6">
          {/* Ready Score */}
          <div className="rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Ready Score</p>
            <div className="mt-3 flex justify-center">
              <RingGauge value={89} size={168} />
            </div>
            <p className="mt-2 text-base font-bold text-success">
              {es ? 'Alta confianza' : 'High confidence'}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {es ? 'Probabilidad de aprobar: ' : 'Probability of passing: '}
              <span className="font-semibold text-text-primary">90%</span>
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {es ? 'Solo 10% más para estar listo.' : 'Only 10% more to be exam-ready.'}
            </p>
          </div>

          {/* Racha + Meta de hoy */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">
                  {es ? 'Racha' : 'Streak'}
                </p>
                <span className="text-warning"><Line d={ic.flame} cls="h-5 w-5" /></span>
              </div>
              <p className="mt-2 text-3xl font-extrabold text-text-primary">12</p>
              <p className="text-xs text-text-secondary">{es ? 'días · ¡sigue así!' : 'days · keep it up!'}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm font-semibold text-text-primary">
                {es ? 'Meta de hoy' : "Today's goal"}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-text-primary">
                8<span className="text-lg text-text-secondary">/15</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary" style={{ width: '53%' }} />
              </div>
            </div>
          </div>

          {/* Continuar aprendiendo */}
          <div className="rounded-2xl border border-border bg-surface p-3 shadow-sm">
            <p className="px-1 pb-2 pt-1 text-sm font-bold text-text-primary">
              {es ? 'Continúa aprendiendo' : 'Continue learning'}
            </p>
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-2xl">🚸</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary">
                  {es ? 'Señales de tránsito' : 'Traffic signs'}
                </p>
                <p className="text-xs text-text-secondary">82% {es ? 'de dominio' : 'mastery'}</p>
              </div>
              <button className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
                {es ? 'Continuar' : 'Continue'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Navegación inferior fija ── */}
        <div className="sticky bottom-0 z-10 flex items-center border-t border-border bg-surface/95 px-2 py-2 backdrop-blur">
          <NavItem d={ic.home} label={es ? 'Inicio' : 'Home'} active />
          <NavItem d={ic.book} label={es ? 'Estudiar' : 'Study'} />
          <NavItem d={ic.exam} label={es ? 'Examen' : 'Exam'} />
          <NavItem d={ic.chart} label={es ? 'Progreso' : 'Progress'} />
          <NavItem d={ic.more} label={es ? 'Más' : 'More'} />
        </div>
      </div>
    </div>
  );
}
