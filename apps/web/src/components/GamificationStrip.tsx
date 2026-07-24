import { useLang } from '../i18n/LangContext';
import type { Gamification } from '../api/types';

/**
 * Tira de gamificación ligera (SPEC §11.3): racha de días, reto diario y logros.
 * Sin componente social. warning se reserva para la racha (§12.1).
 */
export function GamificationStrip({ data }: { data: Gamification }) {
  const { lang } = useLang();
  const es = lang === 'ES';
  const unlocked = data.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* Racha */}
      <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3">
        <span className="text-2xl" aria-hidden>
          🔥
        </span>
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-none text-text-primary">
            {data.streak}
          </p>
          <p className="truncate text-xs text-text-secondary">
            {es ? 'días de racha' : 'day streak'}
          </p>
        </div>
      </div>

      {/* Reto diario */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
        <span className="text-2xl" aria-hidden>
          {data.dailyChallenge.beaten ? '🏆' : '🎯'}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-text-primary">
            {data.dailyChallenge.beaten
              ? es
                ? '¡Reto logrado!'
                : 'Challenge done!'
              : es
                ? 'Reto de hoy'
                : "Today's challenge"}
          </p>
          <p className="truncate text-xs text-text-secondary">
            {es ? 'Supera tu puntaje de ayer' : "Beat yesterday's score"}
          </p>
        </div>
      </div>

      {/* Logros */}
      <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 sm:col-span-1">
        <span className="text-2xl" aria-hidden>
          ⭐
        </span>
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-none text-text-primary">
            {unlocked}/{data.achievements.length}
          </p>
          <p className="truncate text-xs text-text-secondary">
            {es ? 'logros' : 'achievements'}
          </p>
        </div>
      </div>
    </div>
  );
}
