import Link from 'next/link';
import { confirmLoginCode } from '@/lib/valux/actions';
import { devLoginCode } from '@/lib/valux/login';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function CodigoPage({ searchParams }: { searchParams: Promise<{ l?: string; error?: string }> }) {
  const query = await searchParams;
  const devCode = devLoginCode(query.l || '');
  const error = Boolean(query.error);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="font-display text-5xl tracking-wide">Revisa tu correo</h1>
      <form action={confirmLoginCode} className="mt-8 space-y-5">
        <input type="hidden" name="l" value={query.l || ''} />
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium">Código de 6 dígitos</label>
          <input
            id="code"
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            autoFocus
            defaultValue={devCode}
            aria-invalid={error || undefined}
            aria-describedby={error ? 'code-error' : undefined}
            className={`t-input h-16 w-full border bg-white text-center font-mono text-3xl tracking-[0.45em] outline-none transition-colors duration-150 focus:ring-1 ${error ? 'is-shaking border-[#b42318] focus:border-[#b42318] focus:ring-[#b42318]' : 'border-black/20 focus:border-ink focus:ring-ink'}`}
          />
          {error ? (
            <p id="code-error" role="alert" className="mt-2 text-sm text-[#b42318]">
              Código incorrecto o vencido.
            </p>
          ) : null}
        </div>
        <SubmitButton pending="Verificando…">Entrar</SubmitButton>
      </form>
      <p className="mt-10 text-sm text-black/60">
        ¿No llegó? Revisa spam o promociones, o{' '}
        <Link href="/academia/entrar" className="font-medium text-ink underline underline-offset-2">pide otro código</Link>.
      </p>
    </div>
  );
}
