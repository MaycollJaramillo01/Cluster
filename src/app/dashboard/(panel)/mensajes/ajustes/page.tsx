import { addDomain, saveBrand, verifyDomain } from '@/lib/crm/actions';
import { getBrand, listDomains } from '@/lib/crm/queries';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function MessagingSettingsPage() {
  const [domains, brand] = await Promise.all([listDomains(), getBrand()]);

  return (
    <div className="space-y-8">
      <PageTitle title="Ajustes" />
      <section className="space-y-4">
        <h2 className="font-display text-3xl tracking-wide">Dominios</h2>
        <p className="max-w-2xl text-sm text-black/55">
          Confirmar aquí solo marca el dominio dentro del CRM. El envío real pide los registros DNS en el proveedor de correo.
        </p>
        <form action={addDomain} className="flex max-w-md gap-2">
          <input className={fieldClass} name="domain" placeholder="cluster.marketing" required />
          <button className={btn} type="submit">Agregar</button>
        </form>
        <div className="overflow-x-auto border border-black/10 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10">
                {['Dominio', 'Correo', 'Autorización'].map((item) => (
                  <th key={item} className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={domain.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium">{domain.domain}</td>
                  <td className="px-4 py-3">
                    {domain.email_verified ? <span className="text-sm">Confirmado</span> : (
                      <form action={verifyDomain}>
                        <input type="hidden" name="id" value={domain.id} />
                        <input type="hidden" name="which" value="email" />
                        <button className={btnTiny} type="submit">Confirmar correo</button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {domain.auth_verified ? <span className="text-sm">Confirmado</span> : (
                      <form action={verifyDomain}>
                        <input type="hidden" name="id" value={domain.id} />
                        <input type="hidden" name="which" value="auth" />
                        <button className={btnTiny} type="submit">Confirmar autorización</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form action={saveBrand} className="max-w-xl space-y-3 border border-black/10 bg-white p-5">
        <h2 className="font-display text-3xl tracking-wide">Marca</h2>
        <p className="text-sm text-black/55">Nombre y dirección que viajan en los correos comerciales.</p>
        <Field label="Empresa"><input className={fieldClass} name="company_name" defaultValue={brand.company_name} required /></Field>
        <Field label="Dirección"><input className={fieldClass} name="address" defaultValue={brand.address} required /></Field>
        <Field label="Remitente"><input className={fieldClass} name="sender_name" defaultValue={brand.sender_name} required /></Field>
        <Field label="Respuesta"><input className={fieldClass} name="reply_to" type="email" defaultValue={brand.reply_to || ''} /></Field>
        <button className={btn} type="submit">Guardar marca</button>
      </form>
    </div>
  );
}
