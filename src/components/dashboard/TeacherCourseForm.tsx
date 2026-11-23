import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { createCourse } from '@/lib/crm/lms-actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Icon } from '@/components/ui/Icon';

export const courseField = 'block min-h-12 w-full min-w-0 border border-black/25 bg-white px-3 py-2.5 text-base font-normal text-ink placeholder:text-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink';
export const courseLabel = 'block min-w-0 space-y-2 text-sm font-semibold';

export function TeacherCourseForm({ error, staff = false }: { error?: string; staff?: boolean }) {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-5xl [color-scheme:light]">
      <header>
        <Link href={staff ? '/dashboard/cursos' : '/dashboard/profesor'} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
          ← {staff ? 'Cursos' : 'Mis cursos'}
        </Link>
        <Heading level={1} className="mt-2 font-brand text-3xl font-semibold leading-tight sm:text-4xl">Crear curso</Heading>
        <p className="mt-2 max-w-prose text-sm text-black/70">Define qué aprenderá el alumno. Después podrás organizar el temario y preparar cada clase.</p>
      </header>
      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <form action={createCourse} className="min-w-0 border border-black/15 bg-white">
          <VStack gap={5} className="p-5 sm:p-6">
            <Heading level={2} className="font-brand text-xl font-semibold">Ficha del curso</Heading>
            {error ? <p role="alert" className="border-l-2 border-red-800 bg-paper px-3 py-2 text-sm text-red-800">
              {error === 'portada' ? 'La portada no se guardó. Selecciona una imagen de hasta 8 MB o pega un enlace válido.' : 'Completa el título y la descripción para crear el curso.'}
            </p> : null}
            <label className={courseLabel}>Título
              <input className={courseField} name="title" placeholder="Ej. Fotografía de productos con tu celular" required />
            </label>
            <label className={courseLabel}>Descripción
              <textarea className={courseField} name="description" rows={3} placeholder="Explica qué problema resuelve el curso y qué podrá hacer el alumno al terminar." required />
            </label>
            <label className={courseLabel}>Objetivos de aprendizaje
              <textarea className={courseField} name="learning_outcomes" rows={3} placeholder="Escribe un resultado medible por línea." />
            </label>
            <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
              <legend className="sr-only">Audiencia y requisitos</legend>
              <label className={courseLabel}>¿A quién va dirigido?
                <textarea className={courseField} name="audience" rows={2} placeholder="Ej. Personas que venden productos en línea" />
              </label>
              <label className={courseLabel}>Requisitos previos
                <textarea className={courseField} name="prerequisites" rows={2} placeholder="Ej. Un celular con cámara" />
              </label>
            </fieldset>
          </VStack>
          <VStack gap={4} className="border-t border-black/10 p-5 sm:p-6">
            <Heading level={2} className="font-brand text-xl font-semibold">Portada</Heading>
            <label className={courseLabel}>Subir imagen (hasta 8 MB)
              <input className={courseField} name="cover" type="file" accept="image/*" />
            </label>
            <label className={courseLabel}>O pega el enlace de una imagen
              <input className={courseField} name="cover_url" type="url" placeholder="https://…" />
            </label>
          </VStack>
          {staff ? <VStack gap={4} className="border-t border-black/10 p-5 sm:p-6">
            <Heading level={2} className="font-brand text-xl font-semibold">Precio</Heading>
            <label className={courseLabel}>Precio en lempiras
              <input className={courseField} name="price" type="number" min={0} step="0.01" defaultValue={0} />
            </label>
          </VStack> : null}
          <footer className="border-t border-black/10 bg-paper p-5 sm:p-6">
            <SubmitButton pending="Abriendo editor…" className="sm:w-auto">Crear borrador</SubmitButton>
          </footer>
        </form>
        <aside aria-label="Flujo de creación" className="self-start border border-black/15 bg-white p-5">
          <Heading level={2} className="font-brand text-lg font-semibold">Del borrador al catálogo</Heading>
          <ol className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3"><Icon name="pen" size={18} className="shrink-0 text-black/75" aria-hidden="true" /><p><strong>Ficha y portada</strong><br />Guarda los datos con los que presentarás el curso.</p></li>
            <li className="flex gap-3"><Icon name="play" size={18} className="shrink-0 text-black/75" aria-hidden="true" /><p><strong>Temario y clases</strong><br />Organiza los módulos y agrega videos, archivos y actividades.</p></li>
            <li className="flex gap-3"><Icon name="check" size={18} className="shrink-0 text-black/75" aria-hidden="true" /><p><strong>Revisión</strong><br />El superadmin revisa el contenido y autoriza su publicación.</p></li>
          </ol>
        </aside>
      </section>
    </VStack>
  );
}
