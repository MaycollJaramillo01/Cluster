import { submitApplication } from '@/lib/valux/actions';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';

type Field = { name: string; label: string; type?: string; wide?: boolean; long?: boolean; required?: boolean; auto?: string; hint?: string };

// Los nombres de los campos son los que guarda submitApplication: no cambiarlos.
const sections: { id: string; title: string; detail: string; fields: Field[] }[] = [
  { id: 'basicos', title: 'Datos básicos', detail: 'Nombre y correo son obligatorios.', fields: [
    { name: 'full_name', label: 'Nombre completo', required: true, auto: 'name', wide: true, hint: 'Como figura en tu documento.' },
    { name: 'email', label: 'Correo', type: 'email', required: true, auto: 'email' },
    { name: 'photo_url', label: 'Foto (URL)', type: 'url', hint: 'Enlace a una foto tuya.' },
    { name: 'birth_date', label: 'Fecha de nacimiento', type: 'date', auto: 'bday' },
    { name: 'birth_place', label: 'Lugar de nacimiento' },
    { name: 'nationality', label: 'Nacionalidad' },
    { name: 'identity_number', label: 'Identidad' },
    { name: 'gender', label: 'Género' },
    { name: 'marital_status', label: 'Estado civil' },
  ] },
  { id: 'contacto', title: 'Contacto', detail: 'Cómo te localiza el equipo.', fields: [
    { name: 'phone', label: 'Teléfono', type: 'tel', auto: 'tel' },
    { name: 'alt_contact', label: 'Contacto alterno', hint: 'Nombre y teléfono de otra persona.' },
    { name: 'address', label: 'Dirección', auto: 'street-address', wide: true },
    { name: 'social_media', label: 'Redes', wide: true },
  ] },
  { id: 'trabajo', title: 'Formación y trabajo', detail: 'Tu experiencia y lo que aportas.', fields: [
    { name: 'education_level', label: 'Nivel de estudios' },
    { name: 'profession', label: 'Profesión' },
    { name: 'occupation', label: 'Ocupación' },
    { name: 'workplace', label: 'Lugar de trabajo' },
    { name: 'skills', label: 'Habilidades', long: true, wide: true },
    { name: 'org_value', label: 'Qué aportas a la organización', long: true, wide: true },
  ] },
  { id: 'salud', title: 'Salud', detail: 'Opcional y confidencial: solo lo ve el equipo de la academia.', fields: [
    { name: 'blood_type', label: 'Tipo de sangre' },
    { name: 'height_weight', label: 'Estatura y peso' },
    { name: 'medical_condition', label: 'Condición médica' },
    { name: 'allergies', label: 'Alergias' },
  ] },
  { id: 'sobre-ti', title: 'Sobre ti', detail: 'Para conocerte mejor.', fields: [
    { name: 'favorite_colors', label: 'Colores favoritos' },
    { name: 'favorite_food', label: 'Comida favorita' },
    { name: 'favorite_dessert', label: 'Postre favorito' },
    { name: 'hobby', label: 'Pasatiempo' },
  ] },
  { id: 'declaracion', title: 'Declaración', detail: 'Confirma que los datos son correctos.', fields: [
    { name: 'signature', label: 'Firma', hint: 'Escribe tu nombre completo.' },
    { name: 'declaration_date', label: 'Fecha de la declaración', type: 'date' },
  ] },
];

function Input({ field }: { field: Field }) {
  const hintId = field.hint ? `${field.name}-ayuda` : undefined;
  const control = field.long
    ? <textarea id={field.name} name={field.name} rows={3} aria-describedby={hintId} className="academy-field block w-full resize-y" />
    : <input id={field.name} name={field.name} type={field.type || 'text'} required={field.required} autoComplete={field.auto} aria-describedby={hintId} className="academy-field block w-full" />;
  return (
    <VStack gap={2} className={field.wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={field.name} className="text-sm font-semibold">
        {field.label}
        {field.required ? <abbr title="obligatorio" className="ml-1 text-red-700 no-underline">*</abbr> : <small className="ml-1.5 text-xs font-normal text-academy-muted">opcional</small>}
      </label>
      {control}
      {field.hint ? <small id={hintId} className="text-xs text-academy-muted">{field.hint}</small> : null}
    </VStack>
  );
}

export default async function FichaPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const query = await searchParams;

  return (
    <VStack as="main" gap={8} className="academy-page max-w-6xl">
      <VStack as="header" gap={3} className="max-w-3xl">
        <Heading level={1} className="academy-title">Ficha de asociado</Heading>
        <p className="text-lg text-academy-muted">Solicita tu alta como asociado de la academia. El equipo revisa cada ficha. Solo el nombre y el correo son obligatorios.</p>
      </VStack>
      {query.ok ? (
        <HStack as="section" role="status" gap={3} align="start" className="rounded-academy-lg border border-academy-line bg-academy-tint p-5">
          <Icon name="check" size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-academy-primary" />
          <VStack gap={1}>
            <strong className="font-semibold">Ficha enviada.</strong>
            <p className="text-sm text-academy-muted">El equipo de la academia la revisará.</p>
          </VStack>
        </HStack>
      ) : null}
      {query.error ? <p role="alert" className="rounded-academy border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">Faltan el nombre y el correo. Complétalos para enviar la ficha.</p> : null}
      <section className="grid items-start gap-8 lg:grid-cols-[theme(spacing.56)_1fr]">
        <nav aria-label="Secciones de la ficha" className="academy-panel hidden p-2 lg:sticky lg:top-24 lg:block">
          <ol>
            {sections.map((item, index) => (
              <li key={item.id}>
                <a href={`#ficha-${item.id}`} className="academy-nav academy-focus w-full gap-3">
                  <small className="grid size-6 shrink-0 place-items-center rounded-academy border border-academy-line text-xs font-semibold">{index + 1}</small>
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <form action={submitApplication} className="min-w-0 space-y-6">
          {sections.map((item, index) => (
            <fieldset key={item.id} id={`ficha-${item.id}`} className="academy-panel scroll-mt-24 p-5 sm:p-8">
              <legend className="sr-only">{item.title}</legend>
              <HStack as="header" gap={4} align="start" className="mb-6 border-b border-academy-line pb-5">
                <strong aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-academy bg-academy-deep text-sm text-white">{index + 1}</strong>
                <VStack gap={1}>
                  <Heading level={2} className="text-xl font-bold">{item.title}</Heading>
                  <p className="text-sm text-academy-muted">{item.detail}</p>
                </VStack>
              </HStack>
              <section className="grid gap-5 sm:grid-cols-2">
                {item.fields.map((field) => <Input key={field.name} field={field} />)}
              </section>
            </fieldset>
          ))}
          <HStack as="footer" gap={4} align="center" justify="between" wrap="wrap" className="academy-panel p-5 sm:p-6">
            <p className="text-sm text-academy-muted">Al enviar, el equipo de la academia recibe estos datos.</p>
            <AcademySubmit label="Enviar ficha" pending="Enviando…" />
          </HStack>
        </form>
      </section>
    </VStack>
  );
}
