import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import type { MockQuestion } from '../api/types';

const SECONDS_PER_QUESTION = 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Mock() {
  const { state: code = '' } = useParams();
  const { t, pick } = useLang();
  const { email } = useAuth();
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

  if (loading) return <p className="text-slate-500">Cargando…</p>;
  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        No se pudo cargar el simulacro ({error}).
      </p>
    );
  }
  if (!mock || questions.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-slate-900">{t('mockExam')}</h1>
        <p className="mt-2 text-slate-500">
          Aún no hay preguntas aprobadas para este estado.{' '}
          <Link to={`/${code}`} className="underline">
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
          <h1 className="text-2xl font-bold text-slate-900">
            Revisión de respuestas
          </h1>
          <button
            onClick={() => setReviewing(false)}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-100"
          >
            ← Resultados
          </button>
        </div>

        <ol className="mt-6 space-y-6">
          {questions.map((q, qi) => {
            const chosen = answers[q.id];
            const gotItRight =
              chosen !== undefined && q.options[chosen]?.correct;
            return (
              <li
                key={q.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">
                    {qi + 1}. {pick(q, 'text')}
                  </h2>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                      gotItRight
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {gotItRight ? 'Correcta' : 'Incorrecta'}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {q.options.map((option, i) => {
                    const isCorrect = option.correct;
                    const isChosen = chosen === i;
                    let cls = 'border-slate-200 bg-white text-slate-700';
                    if (isCorrect) cls = 'border-green-500 bg-green-50 text-green-900';
                    else if (isChosen) cls = 'border-red-400 bg-red-50 text-red-900';
                    return (
                      <li
                        key={i}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${cls}`}
                      >
                        <span>{pick(option, 'text')}</span>
                        <span className="ml-2 shrink-0 text-xs font-medium">
                          {isCorrect && '✓ Correcta'}
                          {!isCorrect && isChosen && 'Tu respuesta'}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {chosen === undefined && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    No respondiste esta pregunta.
                  </p>
                )}

                <p className="mt-3 text-sm text-slate-700">
                  {pick(q, 'explanation')}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  📖 Referencia del manual: {q.manualRef}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setReviewing(false)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Volver a resultados
          </button>
          <button
            onClick={() => setAttempt((a) => a + 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Nuevo simulacro
          </button>
        </div>
      </section>
    );
  }

  // ─── Resultados ───
  if (submitted && results) {
    const timeUsed = totalTime - timeLeft;
    return (
      <section>
        <div
          className={`rounded-lg p-5 text-center ${
            results.passed ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <h1
            className={`text-2xl font-bold ${
              results.passed ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {results.passed ? '¡Aprobado! ✅' : 'No aprobado ❌'}
          </h1>
          <p className="mt-1 text-slate-700">
            {results.correct} / {results.total} correctas · tiempo{' '}
            {formatTime(timeUsed)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            En el examen real: {mock.state.passThreshold} de{' '}
            {mock.state.examQuestionCount} para aprobar.
          </p>
          {email && (
            <p className="mt-2 text-xs font-medium text-green-700">
              ✓ Resultado guardado en tu progreso
            </p>
          )}
        </div>

        <h2 className="mt-8 text-lg font-semibold text-slate-700">
          Desglose por tema
        </h2>
        <ul className="mt-3 space-y-2">
          {results.byTopic.map((row) => (
            <li
              key={row.topic.slug}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <span className="font-medium text-slate-900">
                {pick(row.topic, 'name')}
              </span>
              <span className="text-slate-500">
                {row.correct} / {row.total}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setReviewing(true)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Revisar preguntas
          </button>
          <button
            onClick={() => setAttempt((a) => a + 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Nuevo simulacro
          </button>
          <Link
            to={`/${code}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Volver al estado
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
        <span className="text-sm text-slate-500">
          Pregunta {index + 1} de {questions.length} · {answeredCount}{' '}
          respondidas
        </span>
        <span
          className={`rounded-md px-2 py-1 text-sm font-mono font-semibold ${
            lowTime ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>

      <h1 className="mt-4 text-xl font-semibold text-slate-900">
        {pick(question, 'text')}
      </h1>

      <ul className="mt-6 space-y-3">
        {question.options.map((option, i) => (
          <li key={i}>
            <button
              onClick={() =>
                setAnswers((prev) => ({ ...prev, [question.id]: i }))
              }
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                chosen === i
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              {pick(option, 'text')}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-40"
        >
          Anterior
        </button>

        {index < questions.length - 1 ? (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Finalizar simulacro
          </button>
        )}
      </div>
    </section>
  );
}
