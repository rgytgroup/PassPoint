import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { QuizRunner } from '../ui/QuizRunner';
import { Button } from '../ui/Button';
import type { ReviewQuestion } from '../api/types';

export function Repaso() {
  const { t, pick, lang } = useLang();
  const { configured, email } = useAuth();
  const es = lang === 'ES';
  const [round, setRound] = useState(0);
  const { data: questions, loading, error } = useAsync(
    () => (email ? api.getReview() : Promise.resolve([] as ReviewQuestion[])),
    [email, round],
  );

  // Sin sesión: invitar a entrar.
  if (!email) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">{t('review')}</h1>
        <p className="mt-2 text-text-secondary">
          {configured
            ? 'Inicia sesión para repasar las preguntas que has fallado.'
            : 'El repaso requiere sesión, aún no configurada.'}
        </p>
        {configured && (
          <Link to="/entrar" className="mt-4 inline-block">
            <Button>Entrar</Button>
          </Link>
        )}
      </section>
    );
  }

  if (loading) return <p className="text-text-secondary">Cargando…</p>;
  if (error) {
    return (
      <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
        No se pudo cargar el repaso ({error}).
      </p>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          {es ? '¡Sin preguntas falladas! 🎉' : 'No missed questions! 🎉'}
        </h1>
        <p className="mt-2 text-text-secondary">
          {es
            ? 'No tienes preguntas pendientes de repaso. Sigue practicando.'
            : 'You have no questions to review. Keep practicing.'}
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="outline">{es ? 'Ir al inicio' : 'Go home'}</Button>
        </Link>
      </section>
    );
  }

  return (
    <QuizRunner
      questions={questions}
      renderBadge={(q) => (
        <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {q.stateCode} · {pick(q.topic, 'name')}
        </span>
      )}
      feedbackCorrect={es ? '¡Correcto! Sale de tu repaso.' : 'Correct! Removed from review.'}
      feedbackWrong={es ? 'Incorrecto. Sigue en tu repaso.' : 'Incorrect. Still in review.'}
      onEach={(q, _idx, correct) => {
        api
          .recordReviewAnswer(q.id, correct)
          .catch((e) => console.error('No se pudo registrar el repaso:', e));
      }}
      renderResults={({ correctCount, total }) => (
        <section className="mx-auto max-w-md text-center">
          <div className="rounded-3xl bg-background-dark px-6 py-10 text-text-on-dark">
            <p className="text-2xl font-extrabold">
              {es ? 'Repaso terminado' : 'Review complete'}
            </p>
            <p className="mt-2 text-text-on-dark/70">
              {es ? 'Limpiaste' : 'You cleared'} {correctCount} {es ? 'de' : 'of'} {total}.
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => setRound((r) => r + 1)}>
              {es ? 'Repasar de nuevo' : 'Review again'}
            </Button>
            <Link to="/">
              <Button variant="outline">{es ? 'Ir al inicio' : 'Go home'}</Button>
            </Link>
          </div>
        </section>
      )}
    />
  );
}
