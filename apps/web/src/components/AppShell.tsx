import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { ic, Line } from '../ui/icons';

/**
 * Shell de la experiencia dentro de un estado (Master Visual): barra lateral en
 * escritorio, navegación inferior en móvil, contenedor tipo tarjeta. Las
 * pantallas del estado se renderizan en el <Outlet/>. Navegación real (§8).
 */
export function AppShell() {
  const { state: code = '' } = useParams();
  const { pathname } = useLocation();
  const { t, lang, toggle } = useLang();
  const { email, configured } = useAuth();
  const es = lang === 'ES';
  const base = `/${code}`;

  const items = [
    { key: 'home', d: ic.home, label: es ? 'Inicio' : 'Home', to: base, match: (p: string) => p === base },
    { key: 'study', d: ic.book, label: es ? 'Estudiar' : 'Study', to: `${base}/estudiar`, match: (p: string) => p.includes('/estudiar') || p.includes('/practica') },
    { key: 'exam', d: ic.exam, label: es ? 'Examen' : 'Exam', to: `${base}/simulacro`, match: (p: string) => p.includes('/simulacro') },
    { key: 'progress', d: ic.chart, label: es ? 'Progreso' : 'Progress', to: `${base}/progreso`, match: (p: string) => p.includes('/progreso') },
    { key: 'coach', d: ic.coach, label: 'AI Coach', to: `${base}/smart`, match: (p: string) => p.includes('/smart') },
  ];
  const bottom = items.filter((i) => i.key !== 'coach');

  return (
    <div className="min-h-screen bg-background lg:p-6">
      <div className="mx-auto flex min-h-screen max-w-[1200px] overflow-hidden bg-surface lg:min-h-[calc(100vh-3rem)] lg:rounded-3xl lg:border lg:border-border lg:shadow-xl">
        {/* ── Barra lateral (escritorio) ── */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
          <Link to="/" className="flex items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-base font-extrabold text-white">P</span>
            <span className="text-lg font-extrabold tracking-tight text-text-primary">PassPoint</span>
          </Link>

          <nav className="mt-6 space-y-1">
            {items.map((n) => {
              const active = n.match(pathname);
              return (
                <Link
                  key={n.key}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active ? 'border-l-4 border-primary bg-primary/10 text-primary' : 'text-text-secondary hover:bg-black/5'
                  }`}
                >
                  <Line d={n.d} cls="h-5 w-5" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="my-4 border-t border-border" />

          {/* Perfil / sesión */}
          {email ? (
            <Link to="/perfil" className="flex items-center gap-3 px-1">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold uppercase text-white">
                {email[0]}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">{email}</p>
                <span className="text-xs font-semibold text-primary">{es ? 'Ver perfil' : 'View Profile'}</span>
              </div>
            </Link>
          ) : (
            configured && (
              <Link to="/entrar" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-black/5">
                <Line d={ic.logout} cls="h-5 w-5" /> {es ? 'Entrar' : 'Sign in'}
              </Link>
            )
          )}

          {/* Premium (pago único, §11.5) */}
          <Link to={`/precios?state=${code}`} className="mt-4 block rounded-2xl bg-primary/5 p-4">
            <span className="text-xl">💎</span>
            <p className="mt-1 text-sm font-bold text-text-primary">{es ? 'Hazte Premium' : 'Go Premium'}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {es ? 'Desbloquea todo con un solo pago.' : 'Unlock everything with one payment.'}
            </p>
            <span className="mt-3 block rounded-xl bg-primary px-3 py-2 text-center text-xs font-semibold text-white">
              {es ? 'Ver precios' : 'See pricing'}
            </span>
          </Link>

          {/* Estado activo / cambiar + idioma */}
          <div className="mt-auto pt-4">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-1 py-1">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Line d={ic.pin} cls="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-bold text-text-primary">{code.toUpperCase()}</p>
                <p className="text-xs font-semibold text-primary">{es ? 'Cambiar estado' : 'Change State'}</p>
              </div>
            </Link>
            <button onClick={toggle} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-black/5">
              <Line d={ic.globe} cls="h-5 w-5" /> {t('langToggle') === 'EN' ? 'English' : 'Español'}
            </button>
          </div>
        </aside>

        {/* ── Contenido ── */}
        <main className="flex min-w-0 flex-1 flex-col bg-background p-4 pb-24 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ── Navegación inferior (móvil/tablet) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center border-t border-border bg-surface/95 px-2 py-2 backdrop-blur lg:hidden">
        {bottom.map((n) => {
          const active = n.match(pathname);
          return (
            <Link
              key={n.key}
              to={n.to}
              className={`flex flex-1 flex-col items-center gap-1 py-1 ${active ? 'text-primary' : 'text-text-secondary'}`}
            >
              <Line d={n.d} cls="h-6 w-6" />
              <span className="text-[10px] font-semibold">{n.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
