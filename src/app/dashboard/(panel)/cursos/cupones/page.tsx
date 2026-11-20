import { listCourses } from '@/lib/crm/lms';
import { saveCoupon } from '@/lib/valux/actions';
import { listCoupons, type Coupon } from '@/lib/valux/coupons';
import { academyMoney as money } from '@/lib/valux/money';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

function day(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' }) : '';
}

export default async function CuponesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const [coupons, courses] = await Promise.all([listCoupons(), listCourses()]);

  const form = (item?: Coupon) => (
    <form key={item?.code || 'nuevo'} action={saveCoupon} className="grid gap-3 border border-black/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      {item ? <input type="hidden" name="editing" value="1" /> : null}
      <Field label="Código">
        <input className={`${fieldClass} uppercase`} name="code" required defaultValue={item?.code} readOnly={Boolean(item)} />
      </Field>
      <Field label="Descuento %"><input className={fieldClass} name="percent" type="number" min="0" max="100" defaultValue={item?.percent || ''} /></Field>
      <Field label="O monto fijo (L)"><input className={fieldClass} name="amount" inputMode="decimal" defaultValue={item?.amount_cents ? (item.amount_cents / 100).toFixed(2) : ''} /></Field>
      <Field label="Curso">
        <select className={fieldClass} name="course_id" defaultValue={item?.course_id || ''}>
          <option value="">Todos los cursos</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </Field>
      <Field label="Usos máximos (vacío = sin tope)"><input className={fieldClass} name="max_uses" type="number" min="1" defaultValue={item?.max_uses ?? ''} /></Field>
      <Field label="Vence el (opcional)"><input className={fieldClass} name="expires_at" type="date" defaultValue={day(item?.expires_at ?? null)} /></Field>
      <div className="flex items-end gap-3 sm:col-span-2">
        {item ? (
          <>
            <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" value="1" defaultChecked={item.active} /> Activo</label>
            <span className="text-xs text-black/45">{item.uses} usos</span>
          </>
        ) : null}
        <button className={btn} type="submit">{item ? 'Guardar' : 'Crear cupón'}</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <PageTitle title="Cupones" />
      <p className="max-w-2xl text-sm text-black/60">
        Los cupones descuentan cursos (no membresías, que son recurrentes). Si pones porcentaje, el monto fijo se ignora.
        El precio con descuento se calcula en el servidor y un uso se cuenta cuando la venta queda entregada.
        La parte del profesor se calcula sobre lo que se cobró de verdad.
      </p>
      {query.error === 'datos' ? <p className="text-sm text-red-700">Falta el código o el descuento.</p> : null}
      {form()}
      <div className="space-y-3">
        {coupons.map((item) => (
          <div key={item.code} className="space-y-1">
            <p className="text-xs text-black/45">
              {item.code} · {item.percent ? `${item.percent}%` : money(item.amount_cents)} · {item.course_title || 'todos los cursos'}
              {item.max_uses ? ` · ${item.uses}/${item.max_uses}` : ''}
            </p>
            {form(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
