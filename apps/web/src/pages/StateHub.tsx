import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { AccessBanner } from '../components/AccessBanner';
import { OfflineDownload } from '../components/OfflineDownload';
import { RingGauge } from '../ui/RingGauge';
import { ic, Line, StopSign } from '../ui/icons';
import { heroFor } from '../data/heroes';

function greeting(es: boolean): string {
  const h = new Date().getHours();
  if (h < 12) return es ? 'Buenos días' : 'Good morning';
  if (h < 19) return es ? 'Buenas tardes' : 'Good afternoon';
  return es ? 'Buenas noches' : 'Good evening';
}

function readyMessage(percent: number, seen: number, es: boolean): string {
  if (seen === 0) return es ? 'Empieza a practicar para medir tu preparación.' : 'Start practicing to measure your readiness.';
  if (percent >= 80) return es ? '¡Estás listo para el examen! 🎉' : "You're ready for the exam! 🎉";
  if (percent >= 60) return es ? '¡Vas muy bien! Sigue así.' : "You're making great progress!";
  if (percent >= 35) return es ? 'Buen avance, sigue practicando.' : 'Good progress, keep practicing.';
  return es ? 'Vas empezando — practica más temas.' : 'Just getting started — practice more.';
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

function CardHead({ title, to }: { title: string; to?: string }) {
  const head = (
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-text-primary">{title}</h3>
      <span className="text-text-secondary"><Line d={ic.chevR} cls="h-4 w-4" /></span>
    </div>
  );
  return to ? <Link to={to}>{head}</Link> : head;
}

export function StateHub() {
  const { state: code = '' } = useParams();
  const { t, pick, lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';

  const { data: state, loading, error } = useAsync(() => api.getState(code), [code]);
  const { data: readiness } = useAsync(() => (email ? api.getReadiness(code) : Promise.resolve(null)), [email, code]);
  const { data: study } = useAsync(() => (email ? api.getStudy(code) : Promise.resolve(null)), [email, code]);
  const { data: game } = useAsync(() => (email ? api.getGamification(lang) : Promise.resolve(null)), [email, lang]);

  if (loading) return <p className="text-text-secondary">Cargando…</p>;
  if (error)
    return <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">No se pudo cargar el estado ({error}).</p>;
  if (!state)
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">Estado no disponible</h1>
        <p className="mt-2 text-text-secondary">
          El estado «{code.toUpperCase()}» aún no está activo.{' '}
          <Link to="/" className="font-semibold text-primary">Ver estados disponibles</Link>
        </p>
      </section>
    );

  const hero = heroFor(code);
  const name = email ? email.split('@')[0].replace(/[._]/g, ' ') : '';
  const percent = readiness?.percent ?? 0;
  const focus = study?.focusTopic ?? null;
  const continueSlug = focus?.slug ?? state.topics[0]?.slug;
  const continueName = focus ? pick(focus, 'name') : state.topics[0] ? pick(state.topics[0], 'name') : '';
  const continuePct = focus?.mastery ?? 0;
  const streak = game?.streak ?? 0;

  return (
    <div className="space-y-4">
      {/* ── Hero del estado ── */}
      <div className="relative h-52 overflow-hidden rounded-2xl text-text-on-dark sm:h-56">
        {hero ? (
          <img src={hero} alt={pick(state, 'name')} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/85 via-background-dark/45 to-background-dark/10" />
        <div className="relative flex h-full flex-col justify-center px-6">
          <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-text-primary">
            <Line d={ic.bell} cls="h-5 w-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark/70">{pick(state, 'name')}</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            {greeting(es)}{name ? `, ${name}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm text-text-on-dark/85">
            {es ? '¿Listo para aprobar tu examen de manejo?' : 'Ready to pass your driving test?'}
          </p>
          <Link to="/" className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-text-primary">
            <span className="text-primary"><Line d={ic.pin} cls="h-4 w-4" /></span>
            {pick(state, 'name')}
            <Line d={ic.chevD} cls="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Grilla de tarjetas ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Ready Score */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <CardHead title="Ready Score" />
          {email && readiness ? (
            <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row">
              <RingGauge value={percent} size={150} label={es ? 'Listo' : 'Ready'} />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold text-text-primary">{readyMessage(percent, readiness.seen, es)}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {es ? 'Sigue estudiando y estarás listo para el examen real.' : "Keep studying and you'll be ready for the real test."}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Metric d={ic.book} value={String(state.topics.length)} label={es ? 'Temas' : 'Topics'} />
                  <Metric d={ic.checkC} value={String(readiness.seen)} label={es ? 'Vistas' : 'Seen'} />
                  <Metric d={ic.target} value={String(readiness.mastered)} label={es ? 'Dominadas' : 'Mastered'} />
                  <Metric d={ic.list} value={String(readiness.total)} label={es ? 'Total' : 'Total'} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-4 py-4 text-center">
              <RingGauge value={0} size={130} label={es ? 'Listo' : 'Ready'} />
              <p className="text-sm text-text-secondary">
                {es ? 'Inicia sesión para medir tu preparación.' : 'Sign in to measure your readiness.'}
              </p>
              <Link to="/entrar" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
                {es ? 'Entrar' : 'Sign in'}
              </Link>
            </div>
          )}
        </div>

        {/* Study Streak */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <CardHead title={es ? 'Racha de estudio' : 'Study Streak'} to={`/${code}/progreso`} />
          <div className="mt-3 flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <p className="text-3xl font-extrabold text-text-primary">
              {streak} <span className="text-lg font-semibold text-text-secondary">{es ? 'días' : 'days'}</span>
            </p>
          </div>
          <div className="mt-4 flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => {
              const on = i < Math.min(streak, 7);
              return (
                <span
                  key={i}
                  className={`grid h-7 w-7 place-items-center rounded-full ${on ? 'bg-primary text-white' : 'border border-border text-text-secondary'}`}
                >
                  {on ? <Line d={ic.check} cls="h-4 w-4" /> : ''}
                </span>
              );
            })}
          </div>
          {game && game.longestStreak > 0 && (
            <p className="mt-3 text-xs text-text-secondary">
              {es ? 'Mejor racha:' : 'Best streak:'} {game.longestStreak} {es ? 'días' : 'days'}
            </p>
          )}
        </div>

        {/* Today's Goal / Plan de hoy */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-bold text-text-primary">{es ? 'Plan de hoy' : "Today's Goal"}</h3>
          {study && study.plan.count > 0 ? (
            <>
              <p className="mt-2 text-sm text-text-secondary">
                {study.plan.count} {es ? 'preguntas' : 'questions'} · ~{study.plan.estMinutes} min
              </p>
              <Link to={`/${code}/smart`} className="mt-4 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">
                {es ? 'Empezar sesión' : 'Start session'}
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-text-secondary">
                {es ? 'Practica un tema para armar tu plan.' : 'Practice a topic to build your plan.'}
              </p>
              <Link to={`/${code}/estudiar`} className="mt-4 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">
                {es ? 'Estudiar' : 'Study'}
              </Link>
            </>
          )}
        </div>

        {/* Continue Learning */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-bold text-text-primary">{es ? 'Continúa aprendiendo' : 'Continue Learning'}</h3>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{continueName || (es ? 'Señales' : 'Road Signs')}</p>
              {email && (
                <>
                  <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${continuePct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{continuePct}% {es ? 'de dominio' : 'mastery'}</p>
                </>
              )}
            </div>
            <StopSign />
          </div>
          <Link
            to={continueSlug ? `/${code}/practica/${continueSlug}` : `/${code}/estudiar`}
            className="mt-4 block rounded-xl border border-primary px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/5"
          >
            {es ? 'Reanudar' : 'Resume'}
          </Link>
        </div>

        {/* AI Coach (motor de reglas, §11.6) */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="font-bold text-primary">AI Coach</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {focus
                  ? es
                    ? `${pick(focus, 'name')} es tu tema débil. ¿Lo repasamos?`
                    : `${pick(focus, 'name')} is your weak topic. Review it?`
                  : es
                    ? 'Recibe un plan según lo que fallas.'
                    : 'Get a plan based on what you miss.'}
              </p>
            </div>
            <span className="text-4xl">🤖</span>
          </div>
          <Link to={`/${code}/smart`} className="mt-4 block rounded-xl border border-primary bg-surface px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/5">
            {es ? 'Abrir Smart Study' : 'Open Smart Study'}
          </Link>
        </div>
      </div>

      <AccessBanner code={code} />
      <OfflineDownload code={code} />

      {/* Quick Actions */}
      <h2 className="pt-2 text-lg font-bold text-text-primary">{es ? 'Acciones rápidas' : 'Quick Actions'}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { d: ic.list, label: es ? 'Practicar' : 'Practice', to: `/${code}/estudiar` },
          { d: ic.cal, label: es ? 'Simulacro' : 'Mock Exam', to: `/${code}/simulacro` },
          { d: ic.target, label: es ? 'Repasar fallos' : 'Review Mistakes', to: '/repaso' },
          { d: ic.sign, label: t('signals'), to: `/${code}/senales` },
        ].map((q) => (
          <Link
            key={q.label}
            to={q.to}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-sm transition hover:border-primary"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Line d={q.d} cls="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-text-primary">{q.label}</span>
            </span>
            <span className="text-text-secondary"><Line d={ic.chevR} cls="h-4 w-4" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
