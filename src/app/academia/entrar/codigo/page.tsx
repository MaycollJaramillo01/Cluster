import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { confirmLoginCode } from '@/lib/valux/actions';
import { devLoginCode } from '@/lib/valux/login';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { AuthShell } from '@/components/academia/AuthShell';
import { publishedCourse } from '@/lib/valux/data';
import { courseLoginQuery, loginCourse } from '@/lib/valux/login-course';

export default async function CodigoPage({ searchParams }: { searchParams: Promise<{ l?: string; error?: string; curso?: string; modo?: string }> }) {
  const query = await searchParams;
  const devCode = devLoginCode(query.l || '');
  const error = Boolean(query.error);
  const slug = loginCourse(query.curso);
  const course = slug ? await publishedCourse(slug) : null;
  const again = `/academia/entrar?modo=${query.modo === 'registro' ? 'registro' : 'entrar'}${courseLoginQuery(query.curso)}`;

  return (
    <AuthShell step={2} course={course}>
      <VStack gap={2}>
        <p className="w-fit rounded-academy-full bg-academy-tint px-3 py-1 text-xs font-semibold text-academy-primary">Paso 2 de 3</p>
        <Heading level={1} className="academy-title">Revisa tu correo</Heading>
        <p className="text-academy-muted">Te enviamos un código de 6 dígitos. Escríbelo para entrar.</p>
      </VStack>
      <form action={confirmLoginCode} className="space-y-5">
        <input type="hidden" name="l" value={query.l || ''} />
        <input type="hidden" name="curso" value={slug} />
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
            aria-describedby={error ? 'code-error code-help' : 'code-help'}
            className={`academy-field t-input h-16 w-full text-center font-mono text-3xl tracking-widest ${error ? 'is-shaking' : ''}`}
          />
          {error ? <p id="code-error" role="alert" className="text-sm font-medium text-red-800">Código incorrecto o vencido. Revisa los números o pide uno nuevo.</p> : null}
          <small id="code-help" className="text-sm text-academy-muted">Sirve una sola vez y vence en 15 minutos.</small>
        </VStack>
        <AcademySubmit pending="Verificando…" label="Entrar" fullWidth />
      </form>
      <VStack as="section" gap={2} aria-label="Ayuda con el código" className="border-t border-academy-line pt-5 text-sm text-academy-muted">
        <p>¿No llegó? Revisa spam o promociones, o <Link href={again} className="font-semibold text-academy-ink underline underline-offset-4">pide otro código</Link>.</p>
        <p><Link href={again} className="font-semibold text-academy-ink underline underline-offset-4">Usar otro correo</Link></p>
      </VStack>
    </AuthShell>
  );
}
