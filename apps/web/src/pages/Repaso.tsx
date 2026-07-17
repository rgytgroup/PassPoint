import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';

export function Repaso() {
  const { t, pick } = useLang();
  const { configured, email } = useAuth();
  const [round, setRound] = useState(0);
  const { data: questions, loading, error } = useAsync(
    () => (email ? api.getReview() : Promise.resolve([])),
    [email, round],
  );

  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [clearedCount, setClearedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setIndex(0);
    setSelectedIdx(null);
    setClearedCount(0);
    setFinished(false);
  }, [questions]);

  // Sin sesión: invitar a entrar.
  if (!email) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-slate-900">{t('review')}</h1>
        <p className="mt-2 text-slate-500">
          {configured
            ? 'Inicia sesión para repasar las preguntas que has fallado.'
            : 'El repaso requiere sesión, aún no configurada.'}
        </p>
        {configured && (
          <Link
            to="/entrar"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Entrar
          </Link>
        )}
      </section>
    );
  }

  if (loading) return <p className="text-slate-500">Cargando…</p>;
  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        No se pudo cargar el repaso ({error}).
      </p>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          ¡Sin preguntas falladas! 🎉
        </h1>
        <p className="mt-2 text-slate-500">
          No tienes preguntas pendientes de repaso. Sigue practicando.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Ir al inicio
        </Link>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Repaso terminado
        </h1>
        <p className="mt-2 text-slate-600">
          Limpiaste {clearedCount} de {questions.length} preguntas. Las que
          fallaste siguen en tu repaso.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setRound((r) => r + 1)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Repasar de nuevo
          </button>
          <Link
            to="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Ir al inicio
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
    const correct = question.options[optionIdx].correct;
    if (correct) setClearedCount((c) => c + 1);
    api
      .recordReviewAnswer(question.id, correct)
      .catch((e) => console.error('No se pudo registrar el repaso:', e));
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
    if (!revealed) return `${base} border-slate-200 bg-white hover:border-slate-400`;
    if (question.options[optionIdx].correct)
      return `${base} border-green-500 bg-green-50 text-green-900`;
    if (optionIdx === selectedIdx)
      return `${base} border-red-400 bg-red-50 text-red-900`;
    return `${base} border-slate-200 bg-white opacity-60`;
  }

  return (
    <section>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {t('review')} · {index + 1} / {questions.length}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs">
          {question.stateCode} · {pick(question.topic, 'name')}
        </span>
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
              ? '¡Correcto! Sale de tu repaso.'
              : 'Incorrecto. Sigue en tu repaso.'}
          </p>
          <p className="mt-2 text-slate-700">{pick(question, 'explanation')}</p>
          <p className="mt-3 text-xs text-slate-500">
            📖 Referencia del manual: {question.manualRef}
          </p>
          <button
            onClick={next}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {index < questions.length - 1 ? 'Siguiente' : 'Terminar'}
          </button>
        </div>
      )}
    </section>
  );
}
