import { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { Button } from '../ui/Button';

const PREF_KEY = 'passpoint.notifications';

export function notificationsEnabled(): boolean {
  return (
    typeof localStorage !== 'undefined' &&
    localStorage.getItem(PREF_KEY) === '1' &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted'
  );
}

/**
 * Opt-in de recordatorios de estudio y racha (SPEC §11.4). Pide permiso del
 * navegador y guarda la preferencia. Los recordatorios se muestran de forma
 * local cuando abres la app; el envío con la app cerrada (push server) queda
 * para una fase futura — aquí no se promete lo que no se cumple.
 */
export function NotificationsToggle() {
  const { lang } = useLang();
  const es = lang === 'ES';
  const supported = typeof Notification !== 'undefined';
  const [enabled, setEnabled] = useState(notificationsEnabled());
  const [busy, setBusy] = useState(false);

  if (!supported) {
    return (
      <p className="text-sm text-text-secondary">
        {es
          ? 'Tu navegador no admite notificaciones.'
          : 'Your browser does not support notifications.'}
      </p>
    );
  }

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        localStorage.setItem(PREF_KEY, '1');
        setEnabled(true);
        new Notification(es ? 'PassPoint' : 'PassPoint', {
          body: es
            ? '¡Listo! Te recordaremos mantener tu racha. 🔥'
            : "You're set! We'll remind you to keep your streak. 🔥",
        });
      }
    } finally {
      setBusy(false);
    }
  }

  function disable() {
    localStorage.removeItem(PREF_KEY);
    setEnabled(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-text-primary">
          {es ? 'Recordatorios de estudio' : 'Study reminders'}
        </p>
        <p className="text-sm text-text-secondary">
          {es
            ? 'Avisos para mantener tu racha diaria.'
            : 'Nudges to keep your daily streak.'}
        </p>
      </div>
      {enabled ? (
        <Button variant="outline" size="md" onClick={disable}>
          {es ? 'Desactivar' : 'Turn off'}
        </Button>
      ) : (
        <Button size="md" onClick={enable} disabled={busy}>
          {busy ? '…' : es ? 'Activar' : 'Turn on'}
        </Button>
      )}
    </div>
  );
}
