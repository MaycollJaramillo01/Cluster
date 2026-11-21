import { VStack } from '@astryxdesign/core/VStack';
import { createCourse } from '@/lib/crm/lms-actions';
import { Field, fieldClass } from '@/components/dashboard/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';

export function TeacherCourseForm({ invalid }: { invalid?: boolean }) {
  return (
    <details open={invalid || undefined} className="border border-black/10 bg-white p-5 sm:p-6">
      <summary className="cursor-pointer font-semibold focus-visible:outline focus-visible:outline-2">Crear curso</summary>
      <form action={createCourse} className="mt-4 max-w-xl [color-scheme:light]">
        <VStack gap={4}>
          <p className="text-sm text-black/70">Crea un borrador, prepara el temario y envíalo al superadmin para que lo publique.</p>
          {invalid ? <p role="alert" className="text-sm text-red-800">Completa el título y la descripción.</p> : null}
          <Field label="Título"><input className={`${fieldClass} bg-white text-ink`} name="title" required /></Field>
          <Field label="Descripción"><textarea className={`${fieldClass} bg-white text-ink`} name="description" rows={3} required /></Field>
          <SubmitButton pending="Creando borrador…" className="sm:w-fit">Crear borrador</SubmitButton>
        </VStack>
      </form>
    </details>
  );
}
