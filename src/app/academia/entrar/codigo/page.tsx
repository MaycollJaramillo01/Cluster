import Link from 'next/link';
import { confirmLoginCode } from '@/lib/valux/actions';
import { devLoginCode } from '@/lib/valux/login';

export default async function CodigoPage({ searchParams }: { searchParams: Promise<{ l?: string; error?: string }> }) {
  const query = await searchParams;
  const devCode = devLoginCode(query.l || '');

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Revisa tu correo</h1>
      <p className="text-sm text-black/60">
        Si el correo tiene cuenta, o la acabas de crear, te llegó un código de 6 dígitos. Sirve una vez y vence en 15 minutos.
      </p>
      {devCode ? (
        <p className="border border-black/10 bg-white px-4 py-3 text-sm">
          Modo local, sin envío de correos. Tu código es <span className="font-medium tabular-nums">{devCode}</span>.
        </p>
      ) : null}
      {query.error ? <p className="text-sm">Código incorrecto, vencido o con demasiados intentos. Prueba de nuevo o pide otro.</p> : null}
      <form action={confirmLoginCode} className="space-y-3 border border-black/10 bg-white p-4">
        <input type="hidden" name="l" value={query.l || ''} />
        <input
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          defaultValue={devCode}
          placeholder="000000"
          className="w-full border border-black/15 px-3 py-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-brand"
        />
        <button className="w-full bg-brand px-4 py-2.5 text-sm font-medium text-ink" type="submit">Entrar</button>
      </form>
      <p className="text-sm text-black/60">
        ¿No llegó? Revisa spam o <Link href="/academia/entrar" className="underline">pide otro código</Link>.
      </p>
    </div>
  );
}
