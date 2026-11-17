import { crm } from '@/lib/crm/db';
import { STAFF_ROLES } from '@/lib/crm/roles';
import { allowedEmails, requireDashboard } from '@/lib/crm/session';
import { removeStaff, resetStaffMfa, saveStaff } from '@/lib/crm/staff-actions';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

const errors: Record<string, string> = {
  datos: 'Faltan correo, nombre o rol.',
  fijo: 'Ese correo es superadmin por configuración del servidor (DASHBOARD_ALLOWED_EMAILS).',
  clave: 'La clave inicial necesita al menos 12 caracteres (obligatoria para una persona nueva).',
};

function roleLabel(id: string) {
  return STAFF_ROLES.find((role) => role.id === id)?.label || id;
}

export default async function EquipoPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; mfa?: string }> }) {
  const session = await requireDashboard();
  const query = await searchParams;
  const sql = await crm();
  const staff = (await sql`
    SELECT s.email, s.name, s.role, (m.secret IS NOT NULL) AS mfa
    FROM crm_staff s LEFT JOIN crm_mfa m ON m.email = s.email
    ORDER BY s.role, s.name
  `) as unknown as { email: string; name: string; role: string; mfa: boolean }[];
  const fixed = (await sql`SELECT email, (secret IS NOT NULL) AS mfa FROM crm_mfa WHERE email = ANY(${allowedEmails()})`) as unknown as {
    email: string;
    mfa: boolean;
  }[];
  const fixedMfa = new Set(fixed.filter((row) => row.mfa).map((row) => row.email));

  return (
    <div className="space-y-6">
      <PageTitle title="Equipo" />
      <ul className="grid gap-2 text-sm text-black/60 md:grid-cols-2">
        {STAFF_ROLES.map((role) => <li key={role.id}><span className="font-medium text-ink">{role.label}:</span> {role.detail}</li>)}
      </ul>
      <p className="text-sm text-black/55">
        Todos entran con clave (o Google) más un código de 6 dígitos de una app de códigos. El profesor ve los cursos donde su correo es el profesor asignado.
      </p>
      {query.error ? <p className="text-sm text-red-700">{errors[query.error] || 'No se pudo guardar.'}</p> : null}
      {query.ok ? <p className="text-sm">Guardado. Pásale el correo y la clave inicial; el segundo factor lo activa al entrar.</p> : null}
      {query.mfa ? <p className="text-sm">Segundo factor reiniciado: en su próxima entrada lo vuelve a activar.</p> : null}

      <div className="space-y-2">
        {allowedEmails().map((email) => (
          <article key={email} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <div>
              <p className="font-medium">{email}</p>
              <p className="text-xs text-black/45">Superadmin fijo (servidor) · {fixedMfa.has(email) ? 'con segundo factor' : 'segundo factor sin activar'}</p>
            </div>
            {email !== session.email ? (
              <form action={resetStaffMfa}>
                <input type="hidden" name="email" value={email} />
                <button className={btnTiny} type="submit">Reiniciar 2FA</button>
              </form>
            ) : null}
          </article>
        ))}
        {staff.map((person) => (
          <article key={person.email} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <div>
              <p className="font-medium">{person.name}</p>
              <p className="text-xs text-black/45">{person.email} · {roleLabel(person.role)} · {person.mfa ? 'con segundo factor' : 'segundo factor sin activar'}</p>
            </div>
            <div className="flex gap-2">
              <form action={resetStaffMfa}>
                <input type="hidden" name="email" value={person.email} />
                <button className={btnTiny} type="submit">Reiniciar 2FA</button>
              </form>
              {person.email !== session.email ? (
                <form action={removeStaff}>
                  <input type="hidden" name="email" value={person.email} />
                  <button className={btnTiny} type="submit">Quitar</button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <form action={saveStaff} className="grid max-w-3xl gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
        <h2 className="font-medium md:col-span-2">Agregar o cambiar rol</h2>
        <Field label="Correo"><input className={fieldClass} name="email" type="email" required /></Field>
        <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
        <Field label="Rol">
          <select className={fieldClass} name="role" defaultValue="contenido">
            {STAFF_ROLES.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
          </select>
        </Field>
        <Field label="Clave inicial (12+; vacía para no cambiarla)"><input className={fieldClass} name="password" type="password" minLength={12} autoComplete="new-password" /></Field>
        <button className={btn} type="submit">Guardar</button>
      </form>
    </div>
  );
}
