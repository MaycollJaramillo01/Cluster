import Link from 'next/link';
import { enterAcademia } from '@/lib/valux/actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

const input = 'h-12 w-full border border-black/20 bg-white px-3 text-base outline-none transition-colors duration-150 placeholder:text-black/35 focus:border-ink focus:ring-1 focus:ring-ink';
const label = 'mb-1.5 block text-sm font-medium';
const tab = 'flex h-10 items-center justify-center text-sm transition-colors duration-150';

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ error?: string; modo?: string }> }) {
  const query = await searchParams;
  const register = query.modo === 'registro';
  const error = query.error === 'enlace'
    ? 'Ese enlace ya se usó o venció. Pide un código nuevo.'
    : query.error === 'datos'
      ? register
        ? 'Revisa tu nombre, el WhatsApp con código de país y el correo.'
        : 'Revisa el correo: parece incompleto.'
      : query.error === 'correo'
        ? 'No pudimos enviar el código. Intenta de nuevo en unos minutos.'
        : '';

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <nav aria-label="Entrar o crear cuenta" className="grid grid-cols-2 border border-black/15 bg-white p-1">
        <Link href="/academia/entrar" aria-current={register ? undefined : 'page'} className={`${tab} ${register ? 'text-black/60 hover:text-ink' : 'bg-ink font-medium text-white'}`}>
          Entrar
        </Link>
        <Link href="/academia/entrar?modo=registro" aria-current={register ? 'page' : undefined} className={`${tab} ${register ? 'bg-ink font-medium text-white' : 'text-black/60 hover:text-ink'}`}>
          Crear cuenta
        </Link>
      </nav>

      <h1 className="mt-8 font-display text-5xl tracking-wide">{register ? 'Crea tu cuenta' : 'Entra a la academia'}</h1>
      <p className="mt-3 text-base text-black/65">
        Sin contraseña: te enviamos un código de 6 dígitos a tu correo{register ? ' para confirmar la cuenta' : ''}.
      </p>

      {error ? (
        <p role="alert" className="mt-6 border border-[#b42318]/30 bg-[#fef3f2] px-4 py-3 text-sm text-[#7a271a]">{error}</p>
      ) : null}

      <form action={enterAcademia} className="mt-8 space-y-5">
        <input type="hidden" name="modo" value={register ? 'registro' : 'entrar'} />
        {register ? (
          <>
            <div>
              <label htmlFor="name" className={label}>Nombre</label>
              <input id="name" name="name" required autoComplete="name" className={input} />
            </div>
            <div>
              <label htmlFor="phone" className={label}>WhatsApp</label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" aria-describedby="phone-hint" placeholder="+504 9999 9999" className={input} />
              <p id="phone-hint" className="mt-1.5 text-sm text-black/55">Con el código de tu país.</p>
            </div>
          </>
        ) : null}
        <div>
          <label htmlFor="email" className={label}>Correo</label>
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" autoFocus={!register} placeholder="tu@correo.com" className={input} />
        </div>
        {register ? (
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm text-black/55">Avisos (opcional)</legend>
            <label className="flex items-start gap-3 text-sm text-black/75">
              <input name="consent_whatsapp" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]" />
              Acepto recibir mensajes de la academia por WhatsApp.
            </label>
            <label className="flex items-start gap-3 text-sm text-black/75">
              <input name="consent_email" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]" />
              Acepto recibir novedades y ofertas por correo.
            </label>
          </fieldset>
        ) : null}
        <SubmitButton pending="Enviando el código…">{register ? 'Crear cuenta' : 'Enviarme el código'}</SubmitButton>
      </form>

      <p className="mt-10 text-sm text-black/60">
        ¿Eres profesor o del equipo? <Link href="/dashboard/login" className="font-medium text-ink underline underline-offset-2">Entra al panel</Link>
      </p>
    </div>
  );
}
