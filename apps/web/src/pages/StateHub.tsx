import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { AccessBanner } from '../components/AccessBanner';
import { OfflineDownload } from '../components/OfflineDownload';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RingGauge } from '../ui/RingGauge';

function readyMessage(percent: number, seen: number, es: boolean): string {
  if (seen === 0)
    return es ? 'Empieza a practicar para medir tu preparación.' : 'Start practicing to measure your readiness.';
  if (percent >= 80) return es ? '¡Estás listo para el examen! 🎉' : "You're ready for the exam! 🎉";
  if (percent >= 60) return es ? 'Casi listo — sigue así.' : 'Almost ready — keep going.';
  if (percent >= 35) return es ? 'Buen avance, sigue practicando.' : 'Good progress, keep practicing.';
  return es ? 'Vas empezando — practica más temas.' : 'Just getting started — practice more.';
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

      {/* Temas / práctica */}
      <h2 className="mt-8 text-lg font-bold text-text-primary">{t('practice')}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {state.topics.map((topic) => (
          <li key={topic.id}>
            <Link to={`/${code}/practica/${topic.slug}`}>
              <Card className="flex items-center justify-between p-4 transition-shadow hover:shadow-md">
                <span className="font-semibold text-text-primary">{pick(topic, 'name')}</span>
                <span className="text-primary">→</span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
