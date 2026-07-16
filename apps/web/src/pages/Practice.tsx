import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';

export function Practice() {
  const { state: code = '', topic: slug = '' } = useParams();
  const { t, pick } = useLang();
  const { data: questions, loading, error } = useAsync(
    () => api.getTopicQuestions(code, slug),
    [code, slug],
  );

  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Reinicia el estado al cambiar de tema.
  useEffect(() => {
    setIndex(0);
    setSelectedIdx(null);
    setCorrectCount(0);
    setFinished(false);
  }, [code, slug]);

  if (loading) return <p className="text-slate-500">Cargando…</p>;
  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        No se pudieron cargar las preguntas ({error}).
      </p>
    );
  }
  if (!questions || questions.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-slate-900">{t('practice')}</h1>
        <p className="mt-2 text-slate-500">
          Este tema aún no tiene preguntas aprobadas.{' '}
          <Link to={`/${code}`} className="underline">
            Volver
          </Link>
        </p>
      </section>
    );
  }

  // Pantalla de resultados.
  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {correctCount} / {questions.length} correctas ({pct}%)
        </h1>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setSelectedIdx(null);
              setCorrectCount(0);
              setFinished(false);
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Reintentar
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

  const question = questions[index];
  const revealed = selectedIdx !== null;

  function choose(optionIdx: number) {
    if (revealed) return;
    setSelectedIdx(optionIdx);
    if (question.options[optionIdx].correct) {
      setCorrectCount((c) => c + 1);
    }
  }

  function next() {
    if (index < questions!.length - 1) {
      setIndex((i) => i + 1);
      setSelectedIdx(null);
    } else {
      setFinished(true);
    }
  }

  function optionClasses(optionIdx: number): string {
    const base =
      'w-full rounded-lg border px-4 py-3 text-left transition disabled:cursor-default';
    if (!revealed) {
      return `${base} border-slate-200 bg-white hover:border-slate-400`;
    }
    if (question.options[optionIdx].correct) {
      return `${base} border-green-500 bg-green-50 text-green-900`;
    }
    if (optionIdx === selectedIdx) {
      return `${base} border-red-400 bg-red-50 text-red-900`;
    }
    return `${base} border-slate-200 bg-white opacity-60`;
  }

  return (
    <section>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Pregunta {index + 1} de {questions.length}
        </span>
        <span>{correctCount} correctas</span>
      </div>

      <h1 className="mt-3 text-xl font-semibold text-slate-900">
        {pick(question, 'text')}
      </h1>

      <ul className="mt-6 space-y-3">
        {question.options.map((option, i) => (
          <li key={i}>
            <button
              disabled={revealed}
              onClick={() => choose(i)}
              className={optionClasses(i)}
            >
              {pick(option, 'text')}
            </button>
          </li>
        ))}
      </ul>

      {revealed && (
        <div className="mt-6 rounded-lg bg-slate-100 p-4">
          <p className="font-medium text-slate-900">
            {question.options[selectedIdx].correct
              ? '¡Correcto!'
              : 'Respuesta incorrecta'}
          </p>
          <p className="mt-2 text-slate-700">{pick(question, 'explanation')}</p>
          <p className="mt-3 text-xs text-slate-500">
            📖 Referencia del manual: {question.manualRef}
          </p>
          <button
            onClick={next}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {index < questions.length - 1 ? 'Siguiente' : 'Ver resultados'}
          </button>
        </div>
      )}
    </section>
  );
}
