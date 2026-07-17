import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Login() {
  const { configured, email: currentEmail, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-2 text-slate-500">
          El inicio de sesión aún no está configurado (faltan las credenciales
          de Supabase).
        </p>
      </section>
    );
  }

  if (currentEmail) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Tu sesión</h1>
        <p className="mt-2 text-slate-600">
          Conectado como <strong>{currentEmail}</strong>.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => signOut()}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
          <Link
            to="/"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Ir al inicio
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
        <h1 className="text-2xl font-bold text-slate-900">Revisa tu correo 📧</h1>
        <p className="mt-2 text-slate-600">
          Te enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo en
          este dispositivo para entrar.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-sm">
      <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
      <p className="mt-2 text-slate-500">
        Te enviamos un enlace mágico a tu correo, sin contraseñas.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? 'Enviando…' : 'Enviar enlace de acceso'}
        </button>
      </form>
    </section>
  );
}
