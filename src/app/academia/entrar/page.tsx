import Link from 'next/link';
import { enterAcademia } from '@/lib/valux/actions';

const input = 'w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand';

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ error?: string; modo?: string }> }) {
  const query = await searchParams;
  const register = query.modo === 'registro';

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">{register ? 'Crear cuenta' : 'Entrar'}</h1>
      <p className="text-sm text-black/60">
        {register
          ? 'Sin contraseña: te enviamos un código de un solo uso a tu correo.'
          : 'Te enviamos un código de un solo uso a tu correo. Sin contraseña.'}
      </p>
      {query.error === 'enlace' ? <p className="text-sm">El enlace ya se usó o venció. Pide un código nuevo.</p> : null}
      {query.error === 'datos' ? <p className="text-sm">Revisa los datos: {register ? 'nombre, WhatsApp (con código de país) y correo' : 'el correo'}.</p> : null}
      <form action={enterAcademia} className="space-y-3 border border-black/10 bg-white p-4">
        <input type="hidden" name="modo" value={register ? 'registro' : 'entrar'} />
        {register ? (
          <>
            <input name="name" required autoComplete="name" placeholder="Nombre" className={input} />
            <input name="phone" type="tel" required autoComplete="tel" placeholder="WhatsApp, ej. +504 9999 9999" className={input} />
          </>
        ) : null}
        <input name="email" type="email" required autoComplete="email" placeholder="Correo" className={input} />
        <button className="w-full bg-brand px-4 py-2.5 text-sm font-medium text-ink" type="submit">
          {register ? 'Crear cuenta' : 'Enviarme el código'}
        </button>
      </form>
      <p className="text-sm text-black/60">
        {register ? (
          <>¿Ya tienes cuenta? <Link href="/academia/entrar" className="underline">Entrar</Link></>
        ) : (
          <>¿Primera vez? <Link href="/academia/entrar?modo=registro" className="underline">Crear cuenta</Link></>
        )}
      </p>
    </div>
  );
}
