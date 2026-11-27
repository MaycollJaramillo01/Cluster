import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { setApplicationStatus } from '@/lib/valux/actions';
import { listApplications } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, PageTitle, Pill, capitalize, fieldClass } from '@/components/dashboard/StaffUi';
import { formatDateTime } from '@/lib/crm/format';

// ponytail: copia de las etiquetas del formulario público (/academia/ficha); un page.tsx no puede exportarlas.
const LABELS: [string, string][] = [
  ['photo_url', 'Foto (URL)'], ['birth_date', 'Fecha de nacimiento'], ['birth_place', 'Lugar de nacimiento'], ['nationality', 'Nacionalidad'],
  ['identity_number', 'Identidad'], ['gender', 'Género'], ['marital_status', 'Estado civil'], ['phone', 'Teléfono'],
  ['alt_contact', 'Contacto alterno'], ['address', 'Dirección'], ['social_media', 'Redes'], ['education_level', 'Nivel de estudios'],
  ['profession', 'Profesión'], ['occupation', 'Ocupación'], ['workplace', 'Lugar de trabajo'], ['skills', 'Habilidades'],
  ['org_value', 'Qué aporta a la organización'], ['blood_type', 'Tipo de sangre'], ['height_weight', 'Estatura y peso'],
  ['medical_condition', 'Condición médica'], ['allergies', 'Alergias'], ['favorite_colors', 'Colores favoritos'],
  ['favorite_food', 'Comida favorita'], ['favorite_dessert', 'Postre favorito'], ['hobby', 'Pasatiempo'], ['signature', 'Firma'],
  ['declaration_date', 'Fecha de la declaración'],
];
const SKIP = new Set(['id', 'created_at', 'status', 'notes', 'full_name', 'email', ...LABELS.map(([key]) => key)]);

const STATUS: Record<string, { label: string; tone: 'ok' | 'wait' | 'off' | 'bad' }> = {
  nueva: { label: 'Nueva', tone: 'wait' },
  revision: { label: 'En revisión', tone: 'wait' },
  aceptada: { label: 'Aceptada', tone: 'ok' },
  rechazada: { label: 'Rechazada', tone: 'bad' },
};

export default async function FichasPage() {
  const applications = await listApplications();

  return (
    <VStack gap={8} className="mx-auto w-full max-w-5xl">
      <PageTitle eyebrow="Alumnos" title="Fichas" description="Solicitudes que llegan desde la ficha de la academia. Cambia su estado y deja una nota interna." />
      {applications.length === 0 ? <Empty title="Nadie ha enviado una ficha." /> : (
        <VStack as="ul" gap={4}>
          {applications.map((item) => {
            const status = STATUS[String(item.status)] || { label: capitalize(String(item.status)), tone: 'wait' as const };
            return (
              <li key={String(item.id)}>
                <article aria-labelledby={`ficha-${String(item.id)}`} className="academy-panel overflow-hidden">
                  <VStack gap={4} className="p-4 sm:p-5">
                    <HStack gap={3} align="center" justify="between" wrap="wrap">
                      <Heading id={`ficha-${String(item.id)}`} level={2} className="break-words text-lg font-bold">{String(item.full_name)}</Heading>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </HStack>
                    <p className="break-words text-sm text-academy-muted">{[item.email, item.phone, item.created_at ? `Recibida el ${formatDateTime(item.created_at as string | Date)}` : ''].filter(Boolean).map(String).join(' · ')}</p>
                    <dl className="grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
                      {[...LABELS, ...Object.keys(item).filter((key) => !SKIP.has(key)).map((key): [string, string] => [key, capitalize(key.replaceAll('_', ' '))])]
                        .filter(([key]) => item[key] != null && String(item[key]).trim())
                        .map(([key, label]) => (
                          <VStack key={key} gap={0} className="min-w-0">
                            <dt className="text-xs font-semibold text-academy-muted">{label}</dt>
                            <dd className="whitespace-pre-wrap break-words">{item[key] instanceof Date ? formatDateTime(item[key] as Date) : String(item[key])}</dd>
                          </VStack>
                        ))}
                    </dl>
                  </VStack>
                  <form action={setApplicationStatus} className="grid items-end gap-4 border-t border-academy-line bg-academy-page p-4 sm:grid-cols-[theme(spacing.48)_minmax(0,1fr)_auto] sm:p-5">
                    <input type="hidden" name="id" value={String(item.id)} />
                    <Field label="Estado">
                      <select className={fieldClass} name="status" defaultValue={String(item.status)}>
                        <option value="nueva">Nueva</option>
                        <option value="revision">En revisión</option>
                        <option value="aceptada">Aceptada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </Field>
                    <Field label="Nota interna"><input className={fieldClass} name="notes" defaultValue={String(item.notes || '')} /></Field>
                    <AcademySubmit label="Guardar" pending="Guardando…" variant="secondary" />
                  </form>
                </article>
              </li>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
}
