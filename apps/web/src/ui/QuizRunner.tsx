import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang } from '../i18n/LangContext';
import type { QuestionOption } from '../api/types';

export interface QuizQuestion {
  id: string;
  textEn: string;
  textEs: string;
  options: QuestionOption[];
  explanationEn: string;
  explanationEs: string;
  manualRef: string;
}

export interface AnswerLogEntry {
  questionId: string;
  chosenIndex: number;
}

interface QuizRunnerProps<Q extends QuizQuestion> {
  questions: Q[];
  /** Insignia opcional por pregunta (p. ej. estado/tema en el repaso). */
  renderBadge?: (q: Q) => ReactNode;
  /** Se llama al elegir cada opción (p. ej. registrar respuesta del repaso). */
  onEach?: (q: Q, chosenIndex: number, correct: boolean) => void;
  /** Se llama al terminar con el registro de respuestas y los aciertos. */
  onFinish?: (log: AnswerLogEntry[], correctCount: number) => void;
  /** Pantalla de resultados. Si se omite, se usa la de por defecto. */
  renderResults?: (info: {
    correctCount: number;
    total: number;
    restart: () => void;
  }) => ReactNode;
  /** Texto mostrado al acertar/fallar en el panel de explicación. */
  feedbackCorrect?: string;
  feedbackWrong?: string;
}

/**
 * Motor de quiz reutilizable (Práctica, Repaso, Smart Study). Presentación con
 * tokens de diseño (§12.1): success solo para acierto, error solo para fallo.
 */
export function QuizRunner<Q extends QuizQuestion>({
  questions,
  renderBadge,
  onEach,
  onFinish,
  renderResults,
  feedbackCorrect,
  feedbackWrong,
}: QuizRunnerProps<Q>) {
  const { pick, lang } = useLang();
  const es = lang === 'ES';

  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const log = useRef<AnswerLogEntry[]>([]);
  const firedFinish = useRef(false);

  // Reinicia si cambia el conjunto de preguntas.
  useEffect(() => {
    setIndex(0);
    setSelectedIdx(null);
    setCorrectCount(0);
    setFinished(false);
    log.current = [];
    firedFinish.current = false;
  }, [questions]);

  useEffect(() => {
    if (finished && !firedFinish.current) {
      firedFinish.current = true;
      onFinish?.(log.current, correctCount);
    }
  }, [finished, correctCount, onFinish]);

  if (questions.length === 0) return null;

  const question = questions[index];
  const revealed = selectedIdx !== null;

  function choose(optionIdx: number) {
    if (revealed) return;
    const correct = question.options[optionIdx].correct;
    setSelectedIdx(optionIdx);
    log.current.push({ questionId: question.id, chosenIndex: optionIdx });
    if (correct) setCorrectCount((c) => c + 1);
    onEach?.(question, optionIdx, correct);
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelectedIdx(null);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setIndex(0);
    setSelectedIdx(null);
    setCorrectCount(0);
    setFinished(false);
    log.current = [];
    firedFinish.current = false;
  }

  if (finished) {
    if (renderResults) {
      return <>{renderResults({ correctCount, total: questions.length, restart })}</>;
    }
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <section className="mx-auto max-w-md text-center">
        <div className="rounded-3xl bg-background-dark px-6 py-10 text-text-on-dark">
          <p className="text-5xl font-extrabold">{pct}%</p>
          <p className="mt-2 text-text-on-dark/70">
            {correctCount} / {questions.length} {es ? 'correctas' : 'correct'}
          </p>
        </div>
        <button
          onClick={restart}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {es ? 'Reintentar' : 'Try again'}
        </button>
      </section>
    );
  }

  function optionClasses(optionIdx: number): string {
    const base =
      'w-full rounded-xl border px-4 py-3 text-left font-medium transition disabled:cursor-default';
    if (!revealed) {
      return `${base} border-border bg-surface text-text-primary hover:border-primary`;
    }
    if (question.options[optionIdx].correct) {
      return `${base} border-success bg-success/10 text-text-primary`;
    }
    if (optionIdx === selectedIdx) {
      return `${base} border-error bg-error/10 text-text-primary`;
    }
    return `${base} border-border bg-surface text-text-secondary opacity-70`;
  }

  const gotIt = revealed && question.options[selectedIdx].correct;

  return (
    <section className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between text-sm font-medium text-text-secondary">
        <span>
          {es ? 'Pregunta' : 'Question'} {index + 1} {es ? 'de' : 'of'}{' '}
          {questions.length}
        </span>
        {renderBadge ? (
          renderBadge(question)
        ) : (
          <span className="rounded-lg bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
            {correctCount} {es ? 'correctas' : 'correct'}
          </span>
        )}
      </div>

      {/* Barra de avance */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <h1 className="mt-6 text-xl font-bold leading-snug text-text-primary sm:text-2xl">
        {pick(question, 'text')}
      </h1>

      <ul className="mt-6 space-y-3">
        {question.options.map((option, i) => (
          <li key={i}>
            <button disabled={revealed} onClick={() => choose(i)} className={optionClasses(i)}>
              {pick(option, 'text')}
            </button>
          </li>
        ))}
      </ul>

      {revealed && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className={`font-bold ${gotIt ? 'text-success' : 'text-error'}`}>
            {gotIt
              ? (feedbackCorrect ?? (es ? '¡Correcto!' : 'Correct!'))
              : (feedbackWrong ?? (es ? 'Respuesta incorrecta' : 'Incorrect answer'))}
          </p>
          <p className="mt-2 text-text-secondary">{pick(question, 'explanation')}</p>
          <p className="mt-3 text-xs text-text-secondary">
            📖 {es ? 'Referencia del manual' : 'Handbook reference'}: {question.manualRef}
          </p>
          <button
            onClick={next}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            {index < questions.length - 1
              ? es
                ? 'Siguiente'
                : 'Next'
              : es
                ? 'Ver resultados'
                : 'See results'}
          </button>
        </div>
      )}
    </section>
  );
}
