import { createOrder, createProduct } from '@/lib/crm/actions';
import { formatDate, money } from '@/lib/crm/format';
import { listContacts, listOrders, listProducts } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, Table, btn, fieldClass } from '@/components/dashboard/ui';

export default async function StorePage() {
  const [products, orders, contacts] = await Promise.all([listProducts(), listOrders(), listContacts({})]);
  const paid = orders.filter((order) => order.status === 'pagado').reduce((sum, order) => sum + order.amount_cents, 0);

  return (
    <div className="space-y-8">
      <PageTitle title="Catálogo" action={<p className="font-display text-4xl">{money(paid)}</p>} />
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <form action={createProduct} className="space-y-3 border border-black/10 bg-white p-4">
          <Field label="Producto">
            <input className={fieldClass} name="name" required />
          </Field>
          <Field label="Precio USD">
            <input className={fieldClass} name="price" type="number" min="0" step="0.01" required />
          </Field>
          <button className={btn} type="submit">Agregar producto</button>
        </form>
        {products.length === 0 ? <Empty title="Sin productos" /> : (
          <Table head={['Producto', 'Precio', 'Estado']}>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{money(product.price_cents)}</td>
                <td className="px-4 py-3 capitalize">{product.status}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
      <div id="pedidos" className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <form action={createOrder} className="space-y-3 border border-black/10 bg-white p-4">
          <h2 className="font-display text-3xl tracking-wide">Pedido</h2>
          <Field label="Producto">
            <select className={fieldClass} name="product_id" required>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Contacto">
            <select className={fieldClass} name="contact_id">
              <option value="">Sin contacto</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Monto, si cambia">
            <input className={fieldClass} name="amount" type="number" min="0" step="0.01" />
          </Field>
          <button className={btn} type="submit" disabled={products.length === 0}>Registrar pedido</button>
        </form>
        {orders.length === 0 ? <Empty title="Sin pedidos" /> : (
          <Table head={['Producto', 'Contacto', 'Monto', 'Fecha']}>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">{order.product_name || '—'}</td>
                <td className="px-4 py-3">{order.contact_name || '—'}</td>
                <td className="px-4 py-3">{money(order.amount_cents)}</td>
                <td className="px-4 py-3 text-black/50">{formatDate(order.created_at)}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
