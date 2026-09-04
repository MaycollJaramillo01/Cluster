'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { writeActor } from './shared';
import { AdminHero } from './AdminHero';
import { LogoutButton } from './CareersAuthGate';
import { TeamPanel } from './TeamPanel';

export function TeamOffice() {
  const t = useTranslations('CareersAdmin');
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch('/api/careers/auth', { cache: 'no-store' });
      const me = (await response.json()) as { email?: string; name?: string; role?: string };
      if (cancelled) return;
      setEmail(me.email ?? '');
      setRole(me.role ?? '');
      if (me.name) writeActor(me.name);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AdminHero title={t('teamHeading')} subtitle={t('teamIntro')} />
      <section className="theme-light bg-paper py-16 text-fg sm:py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/postulaciones"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
            >
              ← {t('back')}
            </Link>
            <LogoutButton />
          </div>

          {role === null ? (
            <p className="mt-16 mono-label text-faint">{t('loading')}</p>
          ) : role !== 'owner' ? (
            <p className="mt-16 text-muted">{t('teamForbidden')}</p>
          ) : (
            <div className="mt-10">
              <TeamPanel
                onNameSaved={(userEmail, name) => {
                  if (userEmail === email) writeActor(name);
                }}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
