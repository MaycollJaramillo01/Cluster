import Link from 'next/link';
import { confirmLoginCode } from '@/lib/valux/actions';
import { devLoginCode } from '@/lib/valux/login';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { courseLoginQuery, loginCourse } from '@/lib/valux/login-course';

export default async function CodigoPage({ searchParams }: { searchParams: Promise<{ l?: string; error?: string; curso?: string; modo?: string }> }) {
  const query = await searchParams;
  const devCode = devLoginCode(query.l || '');
  const error = Boolean(query.error);

  return (
    <VStack as="main" gap={5} className="academy-page max-w-lg">
      <Heading level={1} className="academy-title">Revisa tu correo</Heading>
      <form action={confirmLoginCode} className="academy-panel space-y-5 p-5 sm:p-7">
        <input type="hidden" name="l" value={query.l || ''} />
        <input type="hidden" name="curso" value={loginCourse(query.curso)} />
        <input type="hidden" name="modo" value={query.modo === 'registro' ? 'registro' : 'entrar'} />
        <VStack gap={2}>
          <label htmlFor="code" className="text-sm font-semibold">Código de 6 dígitos</label>
          <input
            id="code"
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            defaultValue={devCode}
            aria-invalid={error || undefined}
            aria-describedby={error ? 'code-error' : undefined}
            className={`academy-field t-input h-16 w-full text-center font-mono text-3xl tracking-widest ${error ? 'is-shaking' : ''}`}
          />
          {error ? (
            <p id="code-error" role="alert" className="text-sm text-red-800">
              Código incorrecto o vencido.
            </p>
          ) : null}
        </VStack>
        <AcademySubmit pending="Verificando…" label="Entrar" fullWidth />
      </form>
      <p className="text-sm text-academy-muted">
        ¿No llegó? Revisa spam o promociones, o{' '}
        <Link href={`/academia/entrar?modo=${query.modo === 'registro' ? 'registro' : 'entrar'}${courseLoginQuery(query.curso)}`} className="font-medium text-ink underline underline-offset-2">pide otro código</Link>.
      </p>
    </VStack>
  );
}
