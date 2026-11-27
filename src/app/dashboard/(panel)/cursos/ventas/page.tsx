import { VStack } from '@astryxdesign/core/VStack';
import { recordSale, refundSale } from '@/lib/valux/actions';
import { academyMoney as money } from '@/lib/valux/money';
import { listCourses } from '@/lib/crm/lms';
import { listPeople, listPlans, listProducts, listSales } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, Notice, PageTitle, Pill, SectionTitle, Table, btnSmall, cell, fieldClass, kindLabel, periodLabel } from '@/components/dashboard/StaffUi';

export default async function VentasPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const [sales, people, courses, products, plans] = await Promise.all([listSales(), listPeople(), listCourses(), listProducts('publicado'), listPlans(true)]);

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle eyebrow="Operación" title="Ventas" description="Cada venta con su comisión y la parte del vendedor. Aquí también registras ventas hechas fuera de la web." />
      {query.error === 'plan' ? <Notice tone="error">Para registrar una membresía elige el plan.</Notice> : null}

      <details open={query.error === 'plan' || undefined} className="academy-panel">
        <summary className="academy-focus flex min-h-12 cursor-pointer list-none items-center px-5 font-semibold text-academy-primary sm:px-6">Registrar una venta manual</summary>
        <form action={recordSale} className="space-y-6 border-t border-academy-line p-5 sm:p-6">
          <fieldset className="grid min-w-0 gap-5 md:grid-cols-2">
            <legend className="pb-4 text-base font-bold">Comprador</legend>
            <Field label="Nombre"><input className={fieldClass} name="name" required autoComplete="off" /></Field>
            <Field label="Correo"><input className={fieldClass} name="email" type="email" required autoComplete="off" /></Field>
          </fieldset>
          <fieldset className="grid min-w-0 gap-5 md:grid-cols-2">
            <legend className="pb-1 text-base font-bold">Qué compró</legend>
            <p className="text-sm text-academy-muted md:col-span-2">Elige el tipo y completa solo el campo que le corresponde.</p>
            <Field label="Tipo">
              <select className={fieldClass} name="kind" defaultValue="curso">
                <option value="curso">Curso</option>
                <option value="producto">Producto</option>
                <option value="suscripcion">Suscripción</option>
              </select>
            </Field>
            <Field label="Curso">
              <select className={fieldClass} name="course_id" defaultValue="">
                <option value="">Elegir si es un curso</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </Field>
            <Field label="Producto">
              <select className={fieldClass} name="product_id" defaultValue="">
                <option value="">Elegir si es un producto</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}
              </select>
            </Field>
            <Field label="Plan (si es suscripción)">
              <select className={fieldClass} name="plan_id" defaultValue="">
                <option value="">Elegir si es una suscripción</option>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {money(plan.price_cents)}/mes</option>)}
              </select>
            </Field>
            <Field label="Meses de suscripción"><input className={fieldClass} name="months" type="number" min="1" defaultValue="1" /></Field>
          </fieldset>
          <AcademySubmit label="Registrar venta" pending="Registrando…" />
        </form>
      </details>

      <VStack as="section" gap={4} aria-labelledby="ventas-lista">
        <SectionTitle id="ventas-lista" title="Historial" description={`${sales.length} ${sales.length === 1 ? 'venta' : 'ventas'} · ${people.length} personas en la academia. Reembolsar quita el acceso; el dinero se devuelve en Stripe o por banco.`} />
        {sales.length === 0 ? <Empty title="Todavía no hay ventas." /> : (
          <Table label="Historial de ventas" head={['Qué', 'Comprador', 'Vendedor', 'Total', 'Comisión', 'Para el vendedor', 'Periodo', 'Estado']}>
            {sales.map((sale) => (
              <tr key={sale.id} className={sale.refunded_at ? 'text-academy-muted' : undefined}>
                <td className={`${cell} max-w-xs`}>
                  <p className="font-semibold">{sale.item_title}</p>
                  <small className="text-xs text-academy-muted">{kindLabel[sale.kind] || sale.kind}</small>
                </td>
                <td className={cell}>{sale.buyer_name}</td>
                <td className={cell}>{sale.seller_name || '—'}</td>
                <td className={`${cell} whitespace-nowrap tabular-nums ${sale.refunded_at ? 'line-through' : ''}`}>{money(sale.amount_cents)}</td>
                <td className={`${cell} whitespace-nowrap tabular-nums`}>{money(sale.fee_cents)}</td>
                <td className={`${cell} whitespace-nowrap tabular-nums`}>{money(sale.seller_cents)}</td>
                <td className={`${cell} whitespace-nowrap`}>{periodLabel(sale.period_ym)}</td>
                <td className={cell}>
                  {sale.refunded_at ? (
                    <Pill tone="off">{sale.refund_reason === 'disputa' ? 'Disputa' : 'Reembolsada'}</Pill>
                  ) : (
                    // Quita el acceso. El dinero se devuelve en Stripe (eso también avisa solo) o por banco.
                    <form action={refundSale}>
                      <input type="hidden" name="id" value={sale.id} />
                      <button className={btnSmall} type="submit">Reembolsar<small className="sr-only"> {sale.item_title} de {sale.buyer_name}</small></button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </VStack>
    </VStack>
  );
}
