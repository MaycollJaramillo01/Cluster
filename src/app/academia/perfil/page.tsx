import Link from 'next/link';
import { updateProfile } from '@/lib/valux/actions';
import { getPerson } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';

export default async function PerfilPage() {
  const person = await getPerson(await academiaPersonId());
  if (!person) {
    return <p className="mx-auto max-w-lg px-4 py-10 text-sm">Entra con tu correo para ver el perfil. <Link className="underline" href="/academia/entrar">Entrar</Link></p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Perfil</h1>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{person.role} · {person.email}</p>
      <form action={updateProfile} className="space-y-3 border border-black/10 bg-white p-4">
        <input type="hidden" name="id" value={person.id} />
        <label className="block text-sm">Nombre<input name="name" defaultValue={person.name} required className="mt-1 w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" /></label>
        <label className="block text-sm">Nicho<input name="niche" defaultValue={person.niche} className="mt-1 w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" /></label>
        <label className="block text-sm">Bio<textarea name="bio" rows={4} defaultValue={person.bio} className="mt-1 w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" /></label>
        <label className="block text-sm">Instagram<input name="instagram_url" defaultValue={person.instagram_url} className="mt-1 w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" /></label>
        <label className="block text-sm">Portafolio<input name="portfolio_url" defaultValue={person.portfolio_url} className="mt-1 w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" /></label>
        <label className="block text-sm">PayPal para liquidaciones<input name="paypal_email" defaultValue={person.paypal_email} className="mt-1 w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" /></label>
        <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Guardar</button>
      </form>
    </div>
  );
}
