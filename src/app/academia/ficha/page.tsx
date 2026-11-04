import { submitApplication } from '@/lib/valux/actions';

const fields: [string, string][] = [
  ['photo_url', 'Foto (URL)'],
  ['birth_date', 'Fecha de nacimiento'],
  ['birth_place', 'Lugar de nacimiento'],
  ['nationality', 'Nacionalidad'],
  ['identity_number', 'Identidad'],
  ['gender', 'Género'],
  ['marital_status', 'Estado civil'],
  ['address', 'Dirección'],
  ['phone', 'Teléfono'],
  ['blood_type', 'Tipo de sangre'],
  ['height_weight', 'Estatura y peso'],
  ['alt_contact', 'Contacto alterno'],
  ['favorite_colors', 'Colores favoritos'],
  ['favorite_food', 'Comida favorita'],
  ['favorite_dessert', 'Postre favorito'],
  ['hobby', 'Pasatiempo'],
  ['occupation', 'Ocupación'],
  ['workplace', 'Lugar de trabajo'],
  ['education_level', 'Nivel de estudios'],
  ['profession', 'Profesión'],
  ['org_value', 'Qué aportas a la organización'],
  ['skills', 'Habilidades'],
  ['social_media', 'Redes'],
  ['medical_condition', 'Condición médica'],
  ['allergies', 'Alergias'],
  ['signature', 'Firma'],
  ['declaration_date', 'Fecha de la declaración'],
];

export default async function FichaPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const query = await searchParams;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Ficha de asociado</h1>
      <p className="max-w-xl text-sm text-black/60">La junta revisa la ficha. Si la acepta, la persona queda como asociado.</p>
      {query.ok ? <p className="text-sm text-brand">Ficha enviada.</p> : null}
      {query.error ? <p className="text-sm">Faltan el nombre y el correo.</p> : null}
      <form action={submitApplication} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Nombre completo</span>
          <input name="full_name" required className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Correo</span>
          <input name="email" type="email" required className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
        </label>
        {fields.map(([name, label]) => (
          <label key={name} className="text-sm">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{label}</span>
            <input name={name} className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
          </label>
        ))}
        <div className="md:col-span-2">
          <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Enviar ficha</button>
        </div>
      </form>
    </div>
  );
}
