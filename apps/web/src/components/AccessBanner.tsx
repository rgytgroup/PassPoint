import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';

/**
 * Muestra el estado de acceso del usuario a un estado (SPEC §5). Si no tiene
 * acceso pagado, invita a desbloquear todo el contenido (muro de pago suave).
 */
export function AccessBanner({ code }: { code: string }) {
  const { lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';
  const { data } = useAsync(
    () => (email ? api.getAccess(code) : Promise.resolve({ access: false })),
    [email, code],
  );

  if (data?.access) {
    return (
      <div className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
        {es ? '✓ Tienes acceso completo a este estado.' : '✓ You have full access to this state.'}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-sm text-amber-900">
        {es
          ? 'Estás en el plan gratis (solo algunas preguntas). Desbloquea el banco completo.'
          : "You're on the free plan (only some questions). Unlock the full bank."}
      </p>
      <Link
        to={`/precios?state=${code}`}
        className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {es ? 'Ver precios' : 'See pricing'}
      </Link>
    </div>
  );
}
