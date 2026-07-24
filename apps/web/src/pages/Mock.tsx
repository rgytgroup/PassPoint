import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Confetti } from '../ui/Confetti';
import type { MockQuestion } from '../api/types';

const SECONDS_PER_QUESTION = 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Mock() {
  const { state: code = '' } = useParams();
  const { t, pick, lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';
  const [attempt, setAttempt] = useState(0);
  const savedRef = useRef(false);
  const { data: mock, loading, error } = useAsync(
    () => api.getMock(code),
    [code, attempt],
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const questions = mock?.questions ?? [];
  const totalTime = questions.length * SECONDS_PER_QUESTION;

  // Reinicia al cargar un nuevo simulacro.
  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setSubmitted(false);
    setReviewing(false);
    savedRef.current = false;
    setTimeLeft((mock?.questions.length ?? 0) * SECONDS_PER_QUESTION);
  }, [mock]);

  // Al entregar, guarda el intento si hay sesión (una sola vez).
  useEffect(() => {
    if (!submitted || !mock || !email || savedRef.current) return;
    savedRef.current = true;
    api
      .saveAttempt({
        stateCode: mock.state.code,
        mode: 'MOCK',
        answers: Object.entries(answers).map(([questionId, chosenIndex]) => ({
          questionId,
          chosenIndex,
        })),
      })
      .catch((e) => console.error('No se pudo guardar el simulacro:', e));
  }, [submitted, mock, email, answers]);

  // Cronómetro: auto-entrega al llegar a 0.
  useEffect(() => {
    if (!mock || submitted) return;
    const id = setInterval(() => {
      setTimeLeft((tleft) => {
        if (tleft <= 1) {
          clearInterval(id);
          setSubmitted(true);
          return 0;
        }
        return tleft - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mock, submitted]);

  const results = useMemo(() => {
    if (!mock) return null;
    let correct = 0;
    const byTopic = new Map<
      string,
      { topic: MockQuestion['topic']; correct: number; total: number }
    >();
    for (const q of mock.questions) {
      const entry = byTopic.get(q.topic.slug) ?? {
        topic: q.topic,
        correct: 0,
        total: 0,
      };
      entry.total += 1;
      const chosen = answers[q.id];
      if (chosen !== undefined && q.options[chosen]?.correct) {
        correct += 1;
        entry.correct += 1;
      }
      byTopic.set(q.topic.slug, entry);
    }
    const total = mock.questions.length;
    const ratio = mock.state.passThreshold / mock.state.examQuestionCount;
    const passed = total > 0 && correct >= Math.ceil(total * ratio);
    return { correct, total, passed, byTopic: [...byTopic.values()] };
  }, [mock, answers]);

  if (loading) return <p className="text-text-secondary">Cargando…</p>;
  if (error) {
    return (
      <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
        No se pudo cargar el simulacro ({error}).
      </p>
    );
  }
  if (!mock || questions.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">{t('mockExam')}</h1>
        <p className="mt-2 text-text-secondary">
          Aún no hay preguntas aprobadas para este estado.{' '}
          <Link to={`/${code}`} className="font-semibold text-primary">
            Volver
          </Link>
        </p>
      </section>
    );
  }

  // ─── Revisión post-simulacro ───
  if (submitted && reviewing) {
    return (
      <section>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">
            {es ? 'Revisión de respuestas' : 'Review answers'}
          </h1>
          <Button variant="outline" size="md" onClick={() => setReviewing(false)}>
            ← {es ? 'Resultados' : 'Results'}
          </Button>
        </div>

        <ol className="mt-6 space-y-6">
          {questions.map((q, qi) => {
            const chosen = answers[q.id];
            const gotItRight = chosen !== undefined && q.options[chosen]?.correct;
            return (
              <li key={q.id}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-text-primary">
                      {qi + 1}. {pick(q, 'text')}
                    </h2>
                    <span
                      className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        gotItRight ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}
                    >
                      {gotItRight ? (es ? 'Correcta' : 'Correct') : es ? 'Incorrecta' : 'Wrong'}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {q.options.map((option, i) => {
                      const isCorrect = option.correct;
                      const isChosen = chosen === i;
                      let cls = 'border-border bg-surface text-text-secondary';
                      if (isCorrect) cls = 'border-success bg-success/10 text-text-primary';
                      else if (isChosen) cls = 'border-error bg-error/10 text-text-primary';
                      return (
                        <li
                          key={i}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${cls}`}
                        >
                          <span>{pick(option, 'text')}</span>
                          <span className="ml-2 shrink-0 text-xs font-semibold">
                            {isCorrect && (es ? '✓ Correcta' : '✓ Correct')}
                            {!isCorrect && isChosen && (es ? 'Tu respuesta' : 'Your answer')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {chosen === undefined && (
                    <p className="mt-2 text-xs font-medium text-warning">
                      {es ? 'No respondiste esta pregunta.' : "You didn't answer this one."}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-text-secondary">{pick(q, 'explanation')}</p>
                  <p className="mt-2 text-xs text-text-secondary">
                    📖 {es ? 'Referencia del manual' : 'Handbook reference'}: {q.manualRef}
                  </p>
                </Card>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => setReviewing(false)}>
            {es ? 'Volver a resultados' : 'Back to results'}
          </Button>
          <Button variant="outline" onClick={() => setAttempt((a) => a + 1)}>
            {es ? 'Nuevo simulacro' : 'New mock'}
          </Button>
        </div>
      </section>
    );
  }

  // ─── Resultados ───
  if (submitted && results) {
    const timeUsed = totalTime - timeLeft;
    const pct = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
    return (
      <section>
        {results.passed && <Confetti />}
        <div className="rounded-3xl bg-background-dark px-6 py-10 text-center text-text-on-dark">
          <p className="text-6xl">{results.passed ? '🎉' : '💪'}</p>
          <h1 className="mt-3 text-3xl font-extrabold">
            {results.passed ? (es ? '¡Aprobado!' : 'Passed!') : es ? 'No aprobado' : 'Not passed'}
          </h1>
          <p className="mt-4 text-5xl font-extrabold">
            <span className={results.passed ? 'text-success' : 'text-warning'}>{pct}%</span>
          </p>
          <p className="mt-2 text-text-on-dark/70">
            {results.correct} / {results.total} {es ? 'correctas · tiempo' : 'correct · time'}{' '}
            {formatTime(timeUsed)}
          </p>
          <p className="mt-1 text-xs text-text-on-dark/50">
            {es ? 'En el examen real:' : 'On the real exam:'} {mock.state.passThreshold}{' '}
            {es ? 'de' : 'of'} {mock.state.examQuestionCount} {es ? 'para aprobar' : 'to pass'}.
          </p>
          {email && (
            <p className="mt-3 text-xs font-semibold text-success">
              ✓ {es ? 'Resultado guardado en tu progreso' : 'Result saved to your progress'}
            </p>
          )}
        </div>

        <h2 className="mt-8 text-lg font-bold text-text-primary">
          {es ? 'Desglose por tema' : 'Breakdown by topic'}
        </h2>
        <ul className="mt-3 space-y-2">
          {results.byTopic.map((row) => {
            const rpct = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
            return (
              <li key={row.topic.slug}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">{pick(row.topic, 'name')}</span>
                    <span className="text-sm font-semibold text-text-secondary">
                      {row.correct} / {row.total}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full ${rpct >= 80 ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${rpct}%` }}
                    />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => setReviewing(true)}>
            {es ? 'Revisar preguntas' : 'Review questions'}
          </Button>
          <Button variant="outline" onClick={() => setAttempt((a) => a + 1)}>
            {es ? 'Nuevo simulacro' : 'New mock'}
          </Button>
          <Link to={`/${code}`}>
            <Button variant="ghost">{es ? 'Volver al estado' : 'Back to state'}</Button>
          </Link>
        </div>
      </section>
    );
  }

  // ─── Examen en curso ───
  const question = questions[index];
  const chosen = answers[question.id];
  const answeredCount = Object.keys(answers).length;
  const lowTime = timeLeft <= 30;

  return (
    <section>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">
          {es ? 'Pregunta' : 'Question'} {index + 1} {es ? 'de' : 'of'} {questions.length} ·{' '}
          {answeredCount} {es ? 'respondidas' : 'answered'}
        </span>
        <span
          className={`rounded-lg px-2 py-1 text-sm font-mono font-semibold ${
            lowTime ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
          }`}
        >
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h1 className="mt-5 text-xl font-bold text-text-primary">{pick(question, 'text')}</h1>

      <ul className="mt-6 space-y-3">
        {question.options.map((option, i) => (
          <li key={i}>
            <button
              onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: i }))}
              className={`w-full rounded-xl border px-4 py-3 text-left font-medium transition ${
                chosen === i
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-text-primary hover:border-primary'
              }`}
            >
              {pick(option, 'text')}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          {es ? 'Anterior' : 'Previous'}
        </Button>

        {index < questions.length - 1 ? (
          <Button variant="outline" onClick={() => setIndex((i) => i + 1)}>
            {es ? 'Siguiente' : 'Next'}
          </Button>
        ) : (
          <Button onClick={() => setSubmitted(true)}>
            {es ? 'Finalizar simulacro' : 'Finish mock'}
          </Button>
        )}
      </div>
    </section>
  );
}
