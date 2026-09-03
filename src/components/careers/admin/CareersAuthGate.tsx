'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export function CareersAuthGate({
  children,
  initial,
}: {
  children: ReactNode;
  initial: 'login' | 'setup' | 'ready';
}) {
  const t = useTranslations('CareersAdmin');
  const [state, setState] = useState<'login' | 'setup' | 'ready'>(initial);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');
    const setup = state === 'setup';
    const response = await fetch('/api/careers/auth', {
      method: setup ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    setSending(false);
    if (!response.ok || !data.ok) {
      if (data.error === 'password_too_short') setError(t('setupError'));
      else if (data.error === 'locked') setError(t('loginLocked'));
      else setError(t('loginError'));
      return;
    }
    setPassword('');
    setState('ready');
  }

  if (state !== 'ready') {
    return (
      <section className="theme-light bg-paper pt-32 pb-20 text-fg">
        <div className="container-x max-w-md">
          <p className="mono-label text-accent">{t('eyebrow')}</p>
          <h1 className="mt-3 text-4xl text-fg">
            {state === 'setup' ? t('setupTitle') : t('loginTitle')}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {state === 'setup' ? t('setupText') : t('loginText')}
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-muted">
              {t('password')}
              <input
                type="password"
                name="password"
                autoComplete={state === 'setup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={state === 'setup' ? 8 : undefined}
                className="mt-1.5 w-full bg-surface px-4 py-3 text-[15px] text-fg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              />
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {sending ? t('entering') : state === 'setup' ? t('setupCta') : t('loginCta')}
            </Button>
            {error ? (
              <p className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

export function LogoutButton() {
  const t = useTranslations('CareersAdmin');

  async function logout() {
    await fetch('/api/careers/auth', { method: 'DELETE' });
    window.location.assign('/postulaciones');
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
    >
      {t('logout')}
    </button>
  );
}
