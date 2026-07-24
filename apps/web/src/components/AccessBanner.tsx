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
      <div className="mt-4 rounded-xl bg-success/10 px-4 py-2 text-sm font-semibold text-success">
        {es ? '✓ Tienes acceso completo a este estado.' : '✓ You have full access to this state.'}
      </div>
    );
  }

  // Copy §11.5: sin lenguaje de "plan/suscripción" — es la versión gratis.
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
      <p className="text-sm text-text-primary">
        {es
          ? 'Estás usando la versión gratis (solo algunas preguntas). Desbloquea el banco completo con un solo pago.'
          : "You're using the free version (only some questions). Unlock the full bank with a one-time payment."}
      </p>
      <Link
        to={`/precios?state=${code}`}
        className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        {es ? 'Ver precios' : 'See pricing'}
      </Link>
    </div>
  );
}
