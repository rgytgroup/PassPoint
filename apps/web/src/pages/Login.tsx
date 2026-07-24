import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../ui/Button';

export function Login() {
  const { configured, email: currentEmail, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">Entrar</h1>
        <p className="mt-2 text-text-secondary">
          El inicio de sesión aún no está configurado (faltan las credenciales de Supabase).
        </p>
      </section>
    );
  }

  if (currentEmail) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">Tu sesión</h1>
        <p className="mt-2 text-text-secondary">
          Conectado como <strong className="text-text-primary">{currentEmail}</strong>.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => signOut()}>
            Cerrar sesión
          </Button>
          <Link to="/">
            <Button>Ir al inicio</Button>
          </Link>
        </div>
      </section>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email);
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  if (sent) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">Revisa tu correo 📧</h1>
        <p className="mt-2 text-text-secondary">
          Te enviamos un enlace de acceso a <strong className="text-text-primary">{email}</strong>.
          Ábrelo en este dispositivo para entrar.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-sm">
      <div className="rounded-3xl bg-background-dark px-6 py-8 text-center text-text-on-dark">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-lg font-extrabold text-white">
          P
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">Entrar</h1>
        <p className="mt-2 text-sm text-text-on-dark/70">
          Te enviamos un enlace mágico a tu correo, sin contraseñas.
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy ? 'Enviando…' : 'Enviar enlace de acceso'}
        </Button>
      </form>
    </section>
  );
}
