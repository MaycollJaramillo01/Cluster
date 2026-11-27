import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { createCourse } from '@/lib/crm/lms-actions';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';
import { Notice, fieldClass as courseField, labelClass as courseLabel } from './StaffUi';


export function TeacherCourseForm({ error, staff = false }: { error?: string; staff?: boolean }) {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-5xl [color-scheme:light]">
      <header>
        <Link href={staff ? '/dashboard/cursos' : '/dashboard/profesor'} className="academy-nav academy-focus">
          <Icon name="arrow-right" size={16} className="rotate-180" /> {staff ? 'Cursos' : 'Mis cursos'}
        </Link>
        <Heading level={1} className="academy-title mt-2">Crear curso</Heading>
        <p className="mt-2 max-w-prose text-academy-muted">Define qué aprenderá el alumno. Después podrás organizar el temario y preparar cada clase.</p>
      </header>
      <section className="grid min-w-0 gap-5 xl:grid-cols-3">
        <form action={createCourse} className="academy-panel min-w-0 overflow-hidden xl:col-span-2">
          <VStack gap={5} className="p-5 sm:p-6">
            <Heading level={2} className="academy-section-title">Ficha del curso</Heading>
            {error ? <Notice tone="error">
              {error === 'portada' ? 'La portada no se guardó. Selecciona una imagen de hasta 8 MB o pega un enlace válido.' : 'Completa el título y la descripción para crear el curso.'}
            </Notice> : null}
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
          <VStack gap={4} className="border-t border-academy-line p-5 sm:p-6">
            <Heading level={2} className="text-xl font-bold">Portada</Heading>
            <label className={courseLabel}>Subir imagen (hasta 8 MB)
              <input className={courseField} name="cover" type="file" accept="image/*" />
            </label>
            <label className={courseLabel}>O pega el enlace de una imagen
              <input className={courseField} name="cover_url" type="url" placeholder="https://…" />
            </label>
          </VStack>
          {staff ? <VStack gap={4} className="border-t border-academy-line p-5 sm:p-6">
            <Heading level={2} className="text-xl font-bold">Precio</Heading>
            <label className={courseLabel}>Precio en lempiras
              <input className={courseField} name="price" type="number" min={0} step="0.01" defaultValue={0} />
            </label>
          </VStack> : null}
          <footer className="border-t border-academy-line bg-academy-page p-5 sm:p-6">
            <AcademySubmit label="Crear borrador" pending="Abriendo editor…" />
          </footer>
        </form>
        <aside aria-label="Flujo de creación" className="academy-panel self-start bg-academy-tint p-5">
          <Heading level={2} className="text-xl font-bold">Del borrador al catálogo</Heading>
          <ol className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3"><Icon name="pen" size={18} className="shrink-0 text-academy-primary" aria-hidden="true" /><p><strong>Ficha y portada</strong><br />Guarda los datos con los que presentarás el curso.</p></li>
            <li className="flex gap-3"><Icon name="play" size={18} className="shrink-0 text-academy-primary" aria-hidden="true" /><p><strong>Temario y clases</strong><br />Organiza los módulos y agrega videos, archivos y actividades.</p></li>
            <li className="flex gap-3"><Icon name="check" size={18} className="shrink-0 text-academy-primary" aria-hidden="true" /><p><strong>Revisión</strong><br />El superadmin revisa el contenido y autoriza su publicación.</p></li>
          </ol>
        </aside>
      </section>
    </VStack>
  );
}
