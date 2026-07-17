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
        <div className="bg-amber-500 px-4 py-1 text-center text-sm font-medium text-white">
          {lang === 'ES'
            ? 'Sin conexión — usando tu contenido descargado.'
            : 'Offline — using your downloaded content.'}
        </div>
      )}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-slate-900">
            {t('appName')}
          </Link>
          <div className="flex items-center gap-2">
            {email && (
              <Link
                to="/repaso"
                className="rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('review')}
              </Link>
            )}
            {configured &&
              (email ? (
                <Link
                  to="/entrar"
                  className="max-w-[10rem] truncate rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                  title={email}
                >
                  {email}
                </Link>
              ) : (
                <Link
                  to="/entrar"
                  className="rounded-md px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Entrar
                </Link>
              ))}
            <button
              onClick={toggle}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-100"
              aria-label="Cambiar idioma / Switch language"
            >
              {t('langToggle')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500">
          <p>{t('notAffiliated')}</p>
          <nav className="mt-2 flex gap-4">
            <Link to="/terminos" className="hover:underline">
              Términos
            </Link>
            <Link to="/privacidad" className="hover:underline">
              Privacidad
            </Link>
            <Link to="/reembolsos" className="hover:underline">
              Reembolsos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
