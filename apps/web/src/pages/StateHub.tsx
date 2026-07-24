import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { AccessBanner } from '../components/AccessBanner';
import { OfflineDownload } from '../components/OfflineDownload';
import { GamificationStrip } from '../components/GamificationStrip';
import { SmartStudyCard } from '../components/SmartStudyCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RingGauge } from '../ui/RingGauge';
import type { TopicMastery } from '../api/types';

function readyMessage(percent: number, seen: number, es: boolean): string {
  if (seen === 0)
    return es ? 'Empieza a practicar para medir tu preparación.' : 'Start practicing to measure your readiness.';
  if (percent >= 80) return es ? '¡Estás listo para el examen! 🎉' : "You're ready for the exam! 🎉";
  if (percent >= 60) return es ? 'Casi listo — sigue así.' : 'Almost ready — keep going.';
  if (percent >= 35) return es ? 'Buen avance, sigue practicando.' : 'Good progress, keep practicing.';
  return es ? 'Vas empezando — practica más temas.' : 'Just getting started — practice more.';
}

/** Fila de tema con su barra de dominio (SPEC §11.2 dominio por tema). */
function TopicRow({
  code,
  topic,
  es,
  name,
}: {
  code: string;
  topic: TopicMastery;
  es: boolean;
  name: string;
}) {
  const barColor = topic.mastery >= 80 ? 'bg-success' : topic.weak ? 'bg-warning' : 'bg-primary';
  return (
    <Link to={`/${code}/practica/${topic.slug}`}>
      <Card className="p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-text-primary">{name}</span>
          <span className="text-sm font-semibold text-text-secondary">{topic.mastery}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${topic.mastery}%` }} />
        </div>
        {topic.weak && topic.seen > 0 && (
          <p className="mt-2 text-xs font-medium text-warning">
            {es ? 'Tema débil — dale prioridad' : 'Weak topic — prioritize it'}
          </p>
        )}
      </Card>
    </Link>
  );
}

export function StateHub() {
  const { state: code = '' } = useParams();
  const { t, pick, lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';

  const { data: state, loading, error } = useAsync(() => api.getState(code), [code]);
  const { data: readiness } = useAsync(
    () => (email ? api.getReadiness(code) : Promise.resolve(null)),
    [email, code],
  );
  const { data: study } = useAsync(
    () => (email ? api.getStudy(code) : Promise.resolve(null)),
    [email, code],
  );
  const { data: game } = useAsync(
    () => (email ? api.getGamification(lang) : Promise.resolve(null)),
    [email, lang],
  );

  if (loading) return <p className="text-text-secondary">Cargando…</p>;
  if (error)
    return (
      <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
        No se pudo cargar el estado ({error}).
      </p>
    );
  if (!state)
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">Estado no disponible</h1>
        <p className="mt-2 text-text-secondary">
          El estado «{code.toUpperCase()}» aún no está activo.{' '}
          <Link to="/" className="font-semibold text-primary">
            Ver estados disponibles
          </Link>
        </p>
      </section>
    );

  // Mapa slug → dominio para pintar barras; si no hay sesión, sin datos.
  const masteryBySlug = new Map((study?.topicMastery ?? []).map((m) => [m.slug, m]));

  return (
    <section>
      <p className="text-sm font-semibold text-primary">{code.toUpperCase()}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
        {pick(state, 'name')}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {es ? 'Examen de' : 'Exam of'} {state.examQuestionCount}{' '}
        {es ? 'preguntas · aprueba con' : 'questions · pass with'} {state.passThreshold}.
      </p>

      {/* Ready Score (SPEC §11.2) */}
      {email && readiness && (
        <Card className="mt-5 flex items-center gap-5">
          <RingGauge value={readiness.percent} label={t('passProbability')} />
          <div className="min-w-0">
            <p className="text-base font-bold text-text-primary">
              {readyMessage(readiness.percent, readiness.seen, es)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {readiness.mastered} {es ? 'de' : 'of'} {readiness.total}{' '}
              {es ? 'preguntas dominadas' : 'questions mastered'}
            </p>
          </div>
        </Card>
      )}

      {/* Gamificación (SPEC §11.3) */}
      {email && game && <GamificationStrip data={game} />}

      {/* Plan de hoy (SPEC §11.1) */}
      {email && study && <SmartStudyCard code={code} study={study} />}

      <AccessBanner code={code} />
      <OfflineDownload code={code} />

      {/* Acciones principales */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link to={`/${code}/simulacro`}>
          <Button size="lg" className="w-full">
            {t('mockExam')}
          </Button>
        </Link>
        <Link to={`/${code}/senales`}>
          <Button variant="outline" size="lg" className="w-full">
            {t('signals')}
          </Button>
        </Link>
      </div>

      {/* Temas / práctica con dominio por tema */}
      <h2 className="mt-8 text-lg font-bold text-text-primary">{t('practice')}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {state.topics.map((topic) => {
          const mastery = masteryBySlug.get(topic.slug);
          const name = pick(topic, 'name');
          return (
            <li key={topic.id}>
              {mastery ? (
                <TopicRow code={code} topic={mastery} es={es} name={name} />
              ) : (
                <Link to={`/${code}/practica/${topic.slug}`}>
                  <Card className="flex items-center justify-between p-4 transition-shadow hover:shadow-md">
                    <span className="font-semibold text-text-primary">{name}</span>
                    <span className="text-primary">→</span>
                  </Card>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
