import { recordSale } from '@/lib/valux/actions';
import { money } from '@/lib/crm/format';
import { listCourses } from '@/lib/crm/lms';
import { listPeople, listProducts, listSales } from '@/lib/valux/data';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function VentasPage() {
  const [sales, people, courses, products] = await Promise.all([listSales(), listPeople(), listCourses(), listProducts('publicado')]);

  return (
    <div className="space-y-6">
      <PageTitle title="Ventas" />
      <p className="max-w-2xl text-sm text-black/60">Cada venta parte el monto: la comisión de la academia y el resto para quien creó el curso o el producto. Con PayPal configurado, el catálogo público cobra ahí. Desde aquí también puedes anotar un pago ya recibido.</p>
      <form action={recordSale} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
        <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
        <Field label="Correo"><input className={fieldClass} name="email" type="email" required /></Field>
        <Field label="Tipo">
          <select className={fieldClass} name="kind" defaultValue="curso">
            <option value="curso">Curso</option>
            <option value="producto">Producto</option>
            <option value="suscripcion">Suscripción</option>
          </select>
        </Field>
        <Field label="Meses de suscripción"><input className={fieldClass} name="months" type="number" min="1" defaultValue="1" /></Field>
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
        <button className={btn} type="submit">Registrar venta</button>
      </form>
      <p className="text-xs text-black/40">{people.length} personas en la academia.</p>
      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
              <th className="px-4 py-3 font-medium">Qué</th>
              <th className="px-4 py-3 font-medium">Comprador</th>
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Comisión</th>
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Periodo</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-black/5">
                <td className="px-4 py-3">{sale.item_title}<span className="ml-2 font-mono text-[10px] uppercase text-black/35">{sale.kind}</span></td>
                <td className="px-4 py-3">{sale.buyer_name}</td>
                <td className="px-4 py-3">{sale.seller_name || '—'}</td>
                <td className="px-4 py-3">{money(sale.amount_cents)}</td>
                <td className="px-4 py-3">{money(sale.fee_cents)}</td>
                <td className="px-4 py-3">{money(sale.seller_cents)}</td>
                <td className="px-4 py-3">{sale.period_ym}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
