'use client';

import { useActionState } from 'react';
import { login } from '@/lib/crm/access';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';

const messages: Record<string, string> = {
  clave: 'El correo o la contraseña no coinciden.',
  corta: 'La contraseña tiene al menos 8 caracteres.',
  setup: 'Primera entrada: usa la contraseña de administrador del servidor (CAREERS_ADMIN_PASSWORD).',
  google: 'Google no completó el ingreso. Intenta de nuevo.',
  config: 'El ingreso con Google no está configurado.',
  lista: 'No hay correos autorizados.',
  state: 'La sesión de Google venció. Intenta de nuevo.',
  vencido: 'Pasaron más de 10 minutos. Vuelve a escribir tu contraseña.',
  cuenta: 'El correo o la contraseña no coinciden.',
};

const input = 'h-12 w-full border bg-white px-3 text-base outline-none transition-colors duration-150 focus:ring-1';

// El error de la URL llega de Google o de un segundo paso vencido; el de la acción, de este mismo formulario.
export function LoginForm({ initialError }: { initialError: string }) {
  const [state, action] = useActionState(login, { error: initialError, email: '', attempt: 0 });
  const message = state.error ? messages[state.error] || 'No se pudo entrar. Intenta de nuevo.' : '';
  const passwordError = state.error === 'clave' || state.error === 'corta' || state.error === 'setup' || state.error === 'cuenta';
  const tone = (bad: boolean) => (bad ? 'border-[#b42318] focus:border-[#b42318] focus:ring-[#b42318]' : 'border-black/20 focus:border-ink focus:ring-ink');

  return (
    <form action={action} className="space-y-5">
      {message ? (
        <p id="login-error" role="alert" className="border border-[#b42318]/30 bg-[#fef3f2] px-4 py-3 text-sm text-[#7a271a]">{message}</p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Correo</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          autoFocus={!state.email}
          defaultValue={state.email}
          key={`email-${state.email}`}
          className={`${input} ${tone(false)}`}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Contraseña</label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          autoFocus={Boolean(state.email)}
          aria-invalid={passwordError || undefined}
          aria-describedby={passwordError ? 'login-error' : undefined}
          key={`password-${state.attempt}`}
          className={`t-input ${input} ${passwordError ? 'is-shaking' : ''} ${tone(passwordError)}`}
        />
      </div>
      <SubmitButton pending="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
