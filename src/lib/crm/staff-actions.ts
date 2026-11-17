'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminHasPassword, saveAdminPassword } from './admins';
import { crm } from './db';
import { resetMfa } from './mfa';
import { isStaffRole } from './roles';
import { allowedEmails, requireDashboard } from './session';

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

// Alta o cambio de rol. La clave inicial se la pasa el superadmin a la persona; el segundo factor lo activa ella al entrar.
export async function saveStaff(formData: FormData) {
  await requireDashboard();
  const email = field(formData, 'email').toLowerCase();
  const name = field(formData, 'name');
  const role = field(formData, 'role');
  const password = String(formData.get('password') ?? '');
  if (!email.includes('@') || !name || !isStaffRole(role)) redirect('/dashboard/equipo?error=datos');
  if (allowedEmails().includes(email)) redirect('/dashboard/equipo?error=fijo');
  if (password && password.length < 12) redirect('/dashboard/equipo?error=clave');
  if (!password && !(await adminHasPassword(email))) redirect('/dashboard/equipo?error=clave');
  const sql = await crm();
  await sql`
    INSERT INTO crm_staff (email, name, role) VALUES (${email}, ${name}, ${role})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
  `;
  if (password) await saveAdminPassword(email, password);
  revalidatePath('/dashboard/equipo');
  redirect('/dashboard/equipo?ok=1');
}

export async function removeStaff(formData: FormData) {
  const session = await requireDashboard();
  const email = field(formData, 'email').toLowerCase();
  if (!email || email === session.email) redirect('/dashboard/equipo');
  const sql = await crm();
  await sql`DELETE FROM crm_staff WHERE email = ${email}`;
  await sql`DELETE FROM crm_admins WHERE email = ${email}`;
  await resetMfa(email);
  revalidatePath('/dashboard/equipo');
  redirect('/dashboard/equipo');
}

// Celular perdido: la próxima entrada vuelve a pedir el alta del segundo factor.
export async function resetStaffMfa(formData: FormData) {
  await requireDashboard();
  const email = field(formData, 'email').toLowerCase();
  if (email) await resetMfa(email);
  revalidatePath('/dashboard/equipo');
  redirect('/dashboard/equipo?mfa=1');
}
