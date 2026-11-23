import { submitApplication } from '@/lib/valux/actions';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';

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
    <VStack as="main" gap={5} className="academy-page max-w-5xl">
      <Heading level={1} className="academy-title">Ficha de asociado</Heading>
      {query.ok ? <p role="status" className="academy-notice">Ficha enviada.</p> : null}
      {query.error ? <p role="alert" className="academy-notice">Faltan el nombre y el correo.</p> : null}
      <form action={submitApplication} className="academy-panel grid gap-4 p-5 sm:p-7 md:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Nombre completo
          <input name="full_name" required autoComplete="name" className="academy-field block w-full" />
        </label>
        <label className="space-y-2 text-sm font-semibold">Correo
          <input name="email" type="email" required autoComplete="email" className="academy-field block w-full" />
        </label>
        {fields.map(([name, label]) => (
          <label key={name} className="space-y-2 text-sm font-semibold">
            {label}
            <input name={name} className="academy-field block w-full" />
          </label>
        ))}
        <footer className="border-t border-academy-line pt-4 md:col-span-2">
          <AcademySubmit label="Enviar ficha" pending="Enviando…" />
        </footer>
      </form>
    </VStack>
  );
}
