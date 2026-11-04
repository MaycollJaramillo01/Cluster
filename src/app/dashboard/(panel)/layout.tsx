import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { processDue } from '@/lib/crm/automations';
import { dashboardUnlocked } from '@/lib/crm/access';
import { sidebarCounts } from '@/lib/crm/queries';
import { Setup, safeDbError } from '@/components/dashboard/Setup';
import { Shell } from '@/components/dashboard/Shell';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await dashboardUnlocked())) redirect('/dashboard/login');

  try {
    const counts = await sidebarCounts();
    try {
      await processDue();
    } catch {
      // Una automatización pendiente no debe tumbar el panel.
    }
    return (
      <Suspense fallback={<p className="p-8 font-mono text-xs uppercase tracking-[0.16em] text-black/40">Cargando</p>}>
        <Shell counts={counts} openAccess={false}>
          {children}
        </Shell>
      </Suspense>
    );
  } catch (error) {
    return <Setup detail={safeDbError(error)} />;
  }
}
