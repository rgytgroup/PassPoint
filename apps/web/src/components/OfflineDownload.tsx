import { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';

type Status = 'idle' | 'downloading' | 'done' | 'error';

/**
 * Descarga (precachea) el banco del estado para usarlo sin conexión.
 * Solo aparece para usuarios con acceso pagado (SPEC §5: "al comprar…").
 */
export function OfflineDownload({ code }: { code: string }) {
  const { lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';
  const { data: access } = useAsync(
    () => (email ? api.getAccess(code) : Promise.resolve({ access: false })),
    [email, code],
  );

  const flagKey = `passpoint.offline.${code}`;
  const already =
    typeof localStorage !== 'undefined' && localStorage.getItem(flagKey) === '1';
  const [status, setStatus] = useState<Status>(already ? 'done' : 'idle');
  const [count, setCount] = useState(0);

  if (!access?.access) return null;

  async function download() {
    setStatus('downloading');
    try {
      const { questions } = await api.prefetchOfflineBank(code);
      setCount(questions);
      localStorage.setItem(flagKey, '1');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-4 flex items-center justify-between rounded-xl bg-success/10 px-4 py-2 text-sm text-success">
        <span>
          {es
            ? '✓ Descargado para usar sin conexión.'
            : '✓ Downloaded for offline use.'}
          {count > 0 && ` (${count})`}
        </span>
        <button onClick={download} className="text-xs underline">
          {es ? 'Actualizar' : 'Update'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-sm text-text-secondary">
        {es
          ? 'Descarga el banco para practicar sin internet.'
          : 'Download the bank to practice without internet.'}
      </p>
      <button
        onClick={download}
        disabled={status === 'downloading'}
        className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-black/5 disabled:opacity-50"
      >
        {status === 'downloading'
          ? es
            ? 'Descargando…'
            : 'Downloading…'
          : status === 'error'
            ? es
              ? 'Reintentar'
              : 'Retry'
            : es
              ? 'Descargar para offline'
              : 'Download for offline'}
      </button>
    </div>
  );
}
