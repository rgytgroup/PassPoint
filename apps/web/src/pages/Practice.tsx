import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { QuizRunner, type AnswerLogEntry } from '../ui/QuizRunner';
import { Button } from '../ui/Button';

export function Practice() {
  const { state: code = '', topic: slug = '' } = useParams();
  const { t, lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';
  const { data: questions, loading, error } = useAsync(
    () => api.getTopicQuestions(code, slug),
    [code, slug],
  );

  // Al terminar, guarda el intento si hay sesión (SPEC §3).
  function persist(log: AnswerLogEntry[]) {
    if (!email || log.length === 0) return;
    api
      .saveAttempt({ stateCode: code, mode: 'PRACTICE', answers: log })
      .catch((e) => console.error('No se pudo guardar el intento:', e));
  }

  if (loading) return <p className="text-text-secondary">Cargando…</p>;
  if (error) {
    return (
      <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
        No se pudieron cargar las preguntas ({error}).
      </p>
    );
  }
  if (!questions || questions.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">{t('practice')}</h1>
        <p className="mt-2 text-text-secondary">
          Este tema aún no tiene preguntas aprobadas.{' '}
          <Link to={`/${code}`} className="font-semibold text-primary">
            Volver
          </Link>
        </p>
      </section>
    );
  }

  return (
    <QuizRunner
      questions={questions}
      onFinish={persist}
      renderResults={({ correctCount, total, restart }) => {
        const pct = Math.round((correctCount / total) * 100);
        return (
          <section className="mx-auto max-w-md text-center">
            <div className="rounded-3xl bg-background-dark px-6 py-10 text-text-on-dark">
              <p className="text-5xl font-extrabold">{pct}%</p>
              <p className="mt-2 text-text-on-dark/70">
                {correctCount} / {total} {es ? 'correctas' : 'correct'}
              </p>
              {email && (
                <p className="mt-3 text-xs font-semibold text-success">
                  ✓ {es ? 'Progreso guardado' : 'Progress saved'}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={restart}>{es ? 'Reintentar' : 'Try again'}</Button>
              <Link to={`/${code}`}>
                <Button variant="outline">{es ? 'Volver al estado' : 'Back to state'}</Button>
              </Link>
            </div>
          </section>
        );
      }}
    />
  );
}
