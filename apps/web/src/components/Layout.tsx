import { Link, Outlet } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function Layout() {
  const { t, lang, toggle } = useLang();
  const { configured, email } = useAuth();
  const online = useOnlineStatus();

  return (
    <div className="flex min-h-screen flex-col">
      {!online && (
        <div className="bg-warning px-4 py-1 text-center text-sm font-semibold text-text-primary">
          {lang === 'ES'
            ? 'Sin conexión — usando tu contenido descargado.'
            : 'Offline — using your downloaded content.'}
        </div>
      )}
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-extrabold text-white">
              P
            </span>
            <span className="text-lg font-extrabold tracking-tight text-text-primary">
              {t('appName')}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {email && (
              <Link
                to="/repaso"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-text-secondary hover:bg-primary/5 hover:text-primary"
              >
                {t('review')}
              </Link>
            )}
            {configured &&
              (email ? (
                <Link
                  to="/perfil"
                  className="max-w-[10rem] truncate rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-black/5"
                  title={email}
                >
                  {email}
                </Link>
              ) : (
                <Link
                  to="/entrar"
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-text-secondary hover:bg-primary/5 hover:text-primary"
                >
                  {lang === 'ES' ? 'Entrar' : 'Sign in'}
                </Link>
              ))}
            <button
              onClick={toggle}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-text-secondary hover:bg-black/5"
              aria-label="Cambiar idioma / Switch language"
            >
              {t('langToggle')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-text-secondary">
          <p>{t('notAffiliated')}</p>
          <nav className="mt-2 flex gap-4">
            <Link to="/terminos" className="hover:text-primary">
              Términos
            </Link>
            <Link to="/privacidad" className="hover:text-primary">
              Privacidad
            </Link>
            <Link to="/reembolsos" className="hover:text-primary">
              Reembolsos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
