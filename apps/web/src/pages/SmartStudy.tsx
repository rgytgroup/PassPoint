import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { QuizRunner, type AnswerLogEntry } from '../ui/QuizRunner';
import { Button } from '../ui/Button';

/**
 * Modo "Smart Study" (SPEC §11.1): sesión armada por el motor de reglas con las
 * preguntas más falladas + no vistas de los temas débiles. Cero IA en runtime.
 */
export function SmartStudy() {
  const { state: code = '' } = useParams();
  const { lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';
  const { data: questions, loading, error } = useAsync(
    () => (email ? api.getSmartSession(code) : Promise.resolve([])),
    [email, code],
  );

  function persist(log: AnswerLogEntry[]) {
    if (!email || log.length === 0) return;
    api
      .saveAttempt({ stateCode: code, mode: 'PRACTICE', answers: log })
      .catch((e) => console.error('No se pudo guardar la sesión:', e));
  }

  if (!email) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">Smart Study</h1>
        <p className="mt-2 text-text-secondary">
          {es ? 'Inicia sesión para tu plan personalizado.' : 'Sign in for your personalized plan.'}
        </p>
        <Link to="/entrar" className="mt-4 inline-block">
          <Button>{es ? 'Entrar' : 'Sign in'}</Button>
        </Link>
      </section>
    );
  }

  if (loading) return <p className="text-text-secondary">Cargando…</p>;
  if (error) {
    return (
      <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
        No se pudo armar la sesión ({error}).
      </p>
    );
  }
  if (!questions || questions.length === 0) {
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          {es ? '¡Vas muy bien! 🎉' : "You're doing great! 🎉"}
        </h1>
        <p className="mt-2 text-text-secondary">
          {es
            ? 'No hay temas débiles por ahora. Sigue practicando para mantener tu preparación.'
            : 'No weak topics right now. Keep practicing to keep your readiness up.'}
        </p>
        <Link to={`/${code}`} className="mt-6 inline-block">
          <Button variant="outline">{es ? 'Volver al estado' : 'Back to state'}</Button>
        </Link>
      </section>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Smart Study</p>
          <h1 className="text-xl font-bold text-text-primary">
            {es ? 'Enfócate en lo que fallas' : 'Focus on what you miss'}
          </h1>
        </div>
        <Link to={`/${code}`} className="text-sm text-text-secondary hover:text-primary">
          ← {code.toUpperCase()}
        </Link>
      </div>
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
                <p className="mt-3 text-xs font-semibold text-success">
                  ✓ {es ? 'Progreso guardado' : 'Progress saved'}
                </p>
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={restart}>{es ? 'Otra ronda' : 'Another round'}</Button>
                <Link to={`/${code}`}>
                  <Button variant="outline">{es ? 'Volver al estado' : 'Back to state'}</Button>
                </Link>
              </div>
            </section>
          );
        }}
      />
    </div>
  );
}
