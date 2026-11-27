import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { listCourses } from '@/lib/crm/lms';
import { saveCoupon } from '@/lib/valux/actions';
import { listCoupons, type Coupon } from '@/lib/valux/coupons';
import { academyMoney as money } from '@/lib/valux/money';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, Notice, PageTitle, Pill, SectionTitle, fieldClass } from '@/components/dashboard/StaffUi';

export const dynamic = 'force-dynamic';

function day(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' }) : '';
}

export default async function CuponesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const [coupons, courses] = await Promise.all([listCoupons(), listCourses()]);

  const form = (item?: Coupon) => (
    <form key={item?.code || 'nuevo'} action={saveCoupon} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {item ? <input type="hidden" name="editing" value="1" /> : null}
      <Field label="Código" hint={item ? 'El código no se puede cambiar.' : undefined}>
        <input className={`${fieldClass} font-mono uppercase`} name="code" required defaultValue={item?.code} readOnly={Boolean(item)} autoComplete="off" spellCheck={false} />
      </Field>
      <Field label="Descuento %"><input className={fieldClass} name="percent" type="number" min="0" max="100" defaultValue={item?.percent || ''} /></Field>
      <Field label="O monto fijo (L)" hint="Se ignora si pones porcentaje."><input className={fieldClass} name="amount" inputMode="decimal" defaultValue={item?.amount_cents ? (item.amount_cents / 100).toFixed(2) : ''} /></Field>
      <Field label="Curso">
        <select className={fieldClass} name="course_id" defaultValue={item?.course_id || ''}>
          <option value="">Todos los cursos</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </Field>
      <Field label="Usos máximos" hint="Vacío: sin tope."><input className={fieldClass} name="max_uses" type="number" min="1" defaultValue={item?.max_uses ?? ''} /></Field>
      <Field label="Vence el (opcional)"><input className={fieldClass} name="expires_at" type="date" defaultValue={day(item?.expires_at ?? null)} /></Field>
      <HStack gap={4} align="center" wrap="wrap" className="sm:col-span-2 lg:col-span-3">
        {item ? <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input name="active" type="checkbox" value="1" defaultChecked={item.active} className="size-4" /> Activo</label> : null}
        <AcademySubmit label={item ? 'Guardar cupón' : 'Crear cupón'} pending="Guardando…" />
      </HStack>
    </form>
  );

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle
        eyebrow="Operación"
        title="Cupones"
        description="Descuentos para cursos (no para membresías, que son recurrentes). El precio con descuento se calcula en el servidor, un uso cuenta cuando la venta queda entregada y la parte del profesor sale de lo que se cobró de verdad."
      />
      {query.error === 'datos' ? <Notice tone="error">Falta el código o el descuento.</Notice> : null}

      <VStack as="section" gap={5} aria-labelledby="cupon-nuevo" className="academy-panel p-5 sm:p-6">
        <SectionTitle id="cupon-nuevo" title="Nuevo cupón" />
        {form()}
      </VStack>

      <VStack as="section" gap={4} aria-labelledby="cupones-lista">
        <SectionTitle id="cupones-lista" title="Cupones creados" />
        {coupons.length === 0 ? <Empty title="Todavía no hay cupones." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {coupons.map((item) => (
              <li key={item.code}>
                <details>
                  <summary className="academy-focus flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-academy-page sm:px-5">
                    <HStack gap={3} align="center" wrap="wrap" className="min-w-0">
                      <code className="rounded-academy bg-academy-tint px-2 py-1 font-mono text-sm font-bold">{item.code}</code>
                      <strong className="text-sm font-semibold">{item.percent ? `${item.percent}%` : money(item.amount_cents)}</strong>
                      <small className="text-sm text-academy-muted">{item.course_title || 'Todos los cursos'}</small>
                    </HStack>
                    <HStack gap={3} align="center">
                      <small className="text-sm tabular-nums text-academy-muted">{item.max_uses ? `${item.uses} de ${item.max_uses} usos` : `${item.uses} usos`}</small>
                      <Pill tone={item.active ? 'ok' : 'off'}>{item.active ? 'Activo' : 'Inactivo'}</Pill>
                      <small className="text-sm font-semibold text-academy-primary">Editar</small>
                    </HStack>
                  </summary>
                  <section aria-label={`Editar ${item.code}`} className="border-t border-academy-line bg-academy-page p-4 sm:p-5">{form(item)}</section>
                </details>
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
