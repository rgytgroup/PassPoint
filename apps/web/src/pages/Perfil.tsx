import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NotificationsToggle } from '../components/NotificationsToggle';

export function Perfil() {
  const { lang, toggle } = useLang();
  const { configured, email, signOut } = useAuth();
  const es = lang === 'ES';
  const { data: game } = useAsync(
    () => (email ? api.getGamification(lang) : Promise.resolve(null)),
    [email, lang],
  );

  // Sin sesión: invitar a entrar.
  if (!email) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">{es ? 'Perfil' : 'Profile'}</h1>
        <p className="mt-2 text-text-secondary">
          {configured
            ? es
              ? 'Inicia sesión para ver tu progreso y logros.'
              : 'Sign in to see your progress and achievements.'
            : es
              ? 'La sesión aún no está configurada.'
              : 'Sign-in is not configured yet.'}
        </p>
        {configured && (
          <Link to="/entrar" className="mt-4 inline-block">
            <Button>{es ? 'Entrar' : 'Sign in'}</Button>
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      {/* Cabecera */}
      <div className="rounded-3xl bg-background-dark px-6 py-8 text-text-on-dark">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-extrabold text-white">
            {email[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{email}</p>
            {game && (
              <p className="text-sm text-text-on-dark/70">
                🔥 {game.streak} {es ? 'días de racha' : 'day streak'} ·{' '}
                {es ? 'mejor' : 'best'} {game.longestStreak}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Logros */}
      {game && (
        <>
          <h2 className="mt-8 text-lg font-bold text-text-primary">
            {es ? 'Logros' : 'Achievements'}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {game.achievements.map((a) => (
              <li key={a.id}>
                <Card
                  className={`flex items-center gap-3 p-4 ${a.unlocked ? '' : 'opacity-55'}`}
                >
                  <span className="text-2xl" aria-hidden>
                    {a.unlocked ? a.icon : '🔒'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-secondary">{a.description}</p>
                  </div>
                  {a.unlocked && (
                    <span className="ml-auto text-xs font-semibold text-success">✓</span>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Configuración */}
      <h2 className="mt-8 text-lg font-bold text-text-primary">
        {es ? 'Configuración' : 'Settings'}
      </h2>
      <div className="mt-4 space-y-3">
        <Card>
          <NotificationsToggle />
        </Card>
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-text-primary">{es ? 'Idioma' : 'Language'}</p>
            <p className="text-sm text-text-secondary">
              {es ? 'Español / English' : 'Spanish / English'}
            </p>
          </div>
          <Button variant="outline" size="md" onClick={toggle}>
            {es ? 'Cambiar a English' : 'Cambiar a Español'}
          </Button>
        </Card>
      </div>

      <div className="mt-8">
        <Button variant="ghost" onClick={() => signOut()}>
          {es ? 'Cerrar sesión' : 'Sign out'}
        </Button>
      </div>
    </section>
  );
}
