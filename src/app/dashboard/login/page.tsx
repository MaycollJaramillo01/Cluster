import { redirect } from 'next/navigation';
import { dashboardSession } from '@/lib/crm/session';
import { homeFor } from '@/lib/crm/roles';

// Un único acceso visual para maestros y estudiantes; conserva los enlaces antiguos.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await dashboardSession();
  if (session) redirect(homeFor(session.role));
  const params = await searchParams;
  const query = new URLSearchParams({ acceso: 'maestros' });
  if (params.error) query.set('error', params.error);
  redirect(`/academia/entrar?${query}`);
}
