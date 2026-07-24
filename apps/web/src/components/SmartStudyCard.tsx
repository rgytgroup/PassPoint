import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { Button } from '../ui/Button';
import type { StudyResponse } from '../api/types';

/**
 * Tarjeta "Plan de hoy" del Smart Study (SPEC §11.1). El copy lo llama
 * "recomendación inteligente" pero es un motor de reglas — cero IA en runtime.
 */
export function SmartStudyCard({ code, study }: { code: string; study: StudyResponse }) {
  const { pick, lang } = useLang();
  const es = lang === 'ES';
  const { plan, focusTopic } = study;

  if (plan.count === 0) return null;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl bg-background-dark p-5 text-text-on-dark">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-on-dark/60">
        <span aria-hidden>✨</span> Smart Study
      </div>
      <p className="mt-2 text-lg font-bold">
        {es ? 'Tu plan de hoy' : 'Your plan for today'}
      </p>
      <p className="mt-1 text-sm text-text-on-dark/70">
        {focusTopic ? (
          <>
            {es ? 'Enfócate en ' : 'Focus on '}
            <span className="font-semibold text-text-on-dark">{pick(focusTopic, 'name')}</span>
            {es ? ' — es tu tema más débil.' : ' — your weakest topic.'}
          </>
        ) : es ? (
          'Repasa las preguntas que más fallas.'
        ) : (
          'Review the questions you miss most.'
        )}
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold">{plan.count}</span>
          <span className="text-xs text-text-on-dark/60">{es ? 'preguntas' : 'questions'}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold">~{plan.estMinutes}</span>
          <span className="text-xs text-text-on-dark/60">min</span>
        </div>
      </div>
      <Link to={`/${code}/smart`} className="mt-4 block">
        <Button className="w-full">{es ? 'Empezar sesión' : 'Start session'}</Button>
      </Link>
    </div>
  );
}
