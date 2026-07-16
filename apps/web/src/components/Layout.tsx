import { Link, Outlet } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';

export function Layout() {
  const { t, toggle } = useLang();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-slate-900">
            {t('appName')}
          </Link>
          <button
            onClick={toggle}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-100"
            aria-label="Cambiar idioma / Switch language"
          >
            {t('langToggle')}
          </button>
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
