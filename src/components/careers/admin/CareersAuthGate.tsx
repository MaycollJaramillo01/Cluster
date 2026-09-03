'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

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
      <section className="crm-shell flex min-h-screen items-center justify-center px-5 py-24">
        <div className="crm-card w-full max-w-md p-8 sm:p-10">
          <p className="text-sm font-medium text-[#02C39A]">{t('eyebrow')}</p>
          <h1 className="mt-2 text-3xl text-[#17201d]">
            {state === 'setup' ? t('setupTitle') : t('loginTitle')}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#5b6b66]">
            {state === 'setup' ? t('setupText') : t('loginText')}
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-[#5b6b66]">
              {t('password')}
              <input
                type="password"
                name="password"
                autoComplete={state === 'setup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={state === 'setup' ? 8 : undefined}
                className="crm-input mt-2"
              />
            </label>
            <button type="submit" className="crm-btn w-full" disabled={sending}>
              {sending ? t('entering') : state === 'setup' ? t('setupCta') : t('loginCta')}
            </button>
            {error ? (
              <p className="rounded-[0.9rem] bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
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
    <button type="button" onClick={logout} className="text-sm text-[#5b6b66] hover:text-[#17201d]">
      {t('logout')}
    </button>
  );
}
