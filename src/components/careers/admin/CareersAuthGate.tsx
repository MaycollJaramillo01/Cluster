'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { writeActor, inputClass } from './shared';
import { AdminHero } from './AdminHero';
import { Button } from '@/components/ui/Button';

type GateState =
  | 'email'
  | 'password'
  | 'setup'
  | 'register'
  | 'pending'
  | 'registered'
  | 'reset'
  | 'sent'
  | 'ready';

type AuthResponse = {
  ok?: boolean;
  error?: string;
  next?: string;
  email?: string;
  name?: string;
  authed?: boolean;
  status?: string;
};

export function CareersAuthGate({
  children,
  initial,
  resetToken = '',
}: {
  children: ReactNode;
  initial: 'email' | 'ready';
  resetToken?: string;
}) {
  const t = useTranslations('CareersAdmin');
  const [state, setState] = useState<GateState>(resetToken ? 'reset' : initial);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [token] = useState(resetToken);

  useEffect(() => {
    if (initial === 'ready') setState('ready');
  }, [initial]);

  async function post(body: Record<string, string>) {
    const response = await fetch('/api/careers/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as AuthResponse;
    return { response, data };
  }

  function showError(code?: string) {
    if (code === 'password_too_short') setError(t('setupError'));
    else if (code === 'locked') setError(t('loginLocked'));
    else if (code === 'unknown_email') setError(t('unknownEmail'));
    else if (code === 'invalid_token') setError(t('resetInvalid'));
    else if (code === 'needs_setup') setError(t('needsSetup'));
    else if (code === 'pending') setError(t('pendingText'));
    else if (code === 'rejected') setError(t('rejectedAccess'));
    else if (code === 'already_registered') setError(t('alreadyRegistered'));
    else if (code === 'name_required') setError(t('nameRequired'));
    else if (code === 'invalid_email') setError(t('invalidEmail'));
    else setError(t('loginError'));
  }

  function remember(value?: string) {
    const display = (value || name || email).trim();
    if (display) writeActor(display);
  }

  function goEmail() {
    setError('');
    setPassword('');
    setConfirm('');
    setState('email');
  }

  async function onEmail(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError('');
    const { data } = await post({ action: 'lookup', email });
    setSending(false);
    setPassword('');
    setConfirm('');
    if (data.next === 'setup') setState('setup');
    else if (data.next === 'password') setState('password');
    else if (data.next === 'pending') setState('pending');
    else if (data.next === 'rejected') setError(t('rejectedAccess'));
    else setState('register');
  }

  async function onPassword(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError('');
    const { response, data } = await post({ action: 'login', email, password });
    setSending(false);
    if (!response.ok || !data.ok) {
      if (data.error === 'needs_setup') {
        setState('setup');
        setError('');
        return;
      }
      if (data.error === 'pending') {
        setState('pending');
        setError('');
        return;
      }
      showError(data.error);
      return;
    }
    remember(data.name);
    setState('ready');
  }

  async function onSetup(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError(t('passwordMismatch'));
      return;
    }
    setSending(true);
    setError('');
    const { response, data } = await post({ action: 'setup', email, password, name });
    setSending(false);
    if (!response.ok || !data.ok) {
      showError(data.error);
      return;
    }
    remember(data.name);
    setState('ready');
  }

  async function onRegister(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError(t('passwordMismatch'));
      return;
    }
    setSending(true);
    setError('');
    const { response, data } = await post({ action: 'register', email, password, name });
    setSending(false);
    if (!response.ok || !data.ok) {
      showError(data.error);
      return;
    }
    remember(data.name);
    if (data.authed) {
      setState('ready');
      return;
    }
    setState('registered');
  }

  async function onForgot() {
    setSending(true);
    setError('');
    await post({ action: 'forgot', email });
    setSending(false);
    setState('sent');
  }

  async function onReset(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError(t('passwordMismatch'));
      return;
    }
    setSending(true);
    setError('');
    const { response, data } = await post({ action: 'reset', token, password });
    setSending(false);
    if (!response.ok || !data.ok) {
      showError(data.error);
      return;
    }
    remember(data.name);
    window.history.replaceState({}, '', '/postulaciones');
    setState('ready');
  }

  if (state === 'ready') return <>{children}</>;

  const showSteps = state === 'email' || state === 'password' || state === 'setup';
  const title =
    state === 'setup'
      ? t('setupTitle')
      : state === 'reset'
        ? t('resetTitle')
        : state === 'sent'
          ? t('forgotSentTitle')
          : state === 'password'
            ? t('passwordTitle')
            : state === 'register'
              ? t('registerTitle')
              : state === 'pending'
                ? t('pendingTitle')
                : state === 'registered'
                  ? t('registerSentTitle')
                  : t('loginTitle');
  const text =
    state === 'setup'
      ? t('setupText')
      : state === 'reset'
        ? t('resetText')
        : state === 'sent'
          ? t('forgotSentText')
          : state === 'password'
            ? t('passwordText', { email })
            : state === 'register'
              ? t('registerText')
              : state === 'pending'
                ? t('pendingText')
                : state === 'registered'
                  ? t('registerSentText')
                  : t('loginText');

  return (
    <>
      <AdminHero title={t('heroTitle')} subtitle={t('heroSubtitle')} />
      <section className="theme-light bg-paper py-16 text-fg sm:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-md border border-ink-950/10 bg-paper p-8 sm:p-10">
            <p className="mono-label text-accent">{t('eyebrow')}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink-950">{title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{text}</p>

            {showSteps ? (
              <div className="mt-6 flex gap-2">
                <StepDot active={state !== 'email'} done={state !== 'email'} label={t('stepEmail')} />
                <StepDot
                  active={state === 'password' || state === 'setup'}
                  done={false}
                  label={t('stepPassword')}
                />
              </div>
            ) : null}

            {state === 'email' ? (
              <form onSubmit={onEmail} className="mt-7 space-y-4">
                <Field
                  label={t('email')}
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={setEmail}
                  placeholder="tu@cluster.marketing"
                />
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? t('entering') : t('continueCta')}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-accent hover:text-fg"
                  onClick={() => {
                    setError('');
                    setState('register');
                  }}
                >
                  {t('goToRegister')}
                </button>
              </form>
            ) : null}

            {state === 'password' ? (
              <form onSubmit={onPassword} className="mt-7 space-y-4">
                <Field
                  label={t('password')}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                />
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? t('entering') : t('loginCta')}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button type="button" className="text-muted hover:text-fg" onClick={goEmail}>
                    {t('changeEmail')}
                  </button>
                  <button
                    type="button"
                    className="text-accent hover:text-fg"
                    onClick={onForgot}
                    disabled={sending}
                  >
                    {t('forgotCta')}
                  </button>
                </div>
              </form>
            ) : null}

            {state === 'setup' ? (
              <form onSubmit={onSetup} className="mt-7 space-y-4">
                <Field
                  label={t('registerName')}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={setName}
                  placeholder={t('namePlaceholder')}
                />
                <Field
                  label={t('password')}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                  minLength={8}
                />
                <Field
                  label={t('passwordConfirm')}
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={setConfirm}
                  minLength={8}
                />
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? t('entering') : t('setupCta')}
                </Button>
                <button type="button" className="w-full text-sm text-muted hover:text-fg" onClick={goEmail}>
                  {t('changeEmail')}
                </button>
              </form>
            ) : null}

            {state === 'register' ? (
              <form onSubmit={onRegister} className="mt-7 space-y-4">
                <Field
                  label={t('registerName')}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={setName}
                  placeholder={t('namePlaceholder')}
                />
                <Field
                  label={t('email')}
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={setEmail}
                  placeholder="tu@cluster.marketing"
                />
                <Field
                  label={t('password')}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                  minLength={8}
                />
                <Field
                  label={t('passwordConfirm')}
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={setConfirm}
                  minLength={8}
                />
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? t('entering') : t('registerSubmit')}
                </Button>
                <button type="button" className="w-full text-sm text-muted hover:text-fg" onClick={goEmail}>
                  {t('goToLogin')}
                </button>
              </form>
            ) : null}

            {state === 'reset' ? (
              <form onSubmit={onReset} className="mt-7 space-y-4">
                <Field
                  label={t('password')}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                  minLength={8}
                />
                <Field
                  label={t('passwordConfirm')}
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={setConfirm}
                  minLength={8}
                />
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? t('entering') : t('resetCta')}
                </Button>
              </form>
            ) : null}

            {state === 'sent' || state === 'pending' || state === 'registered' ? (
              <Button type="button" size="lg" className="mt-7 w-full" onClick={goEmail}>
                {t('backToEmail')}
              </Button>
            ) : null}

            {error ? (
              <p
                className="mt-4 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className={`h-1.5 flex-1 ${active || done ? 'bg-accent' : 'bg-ink-950/10'}`} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <label className="block text-sm font-medium text-muted">
      {label}
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        minLength={minLength}
        required
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} mt-2`}
      />
    </label>
  );
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
