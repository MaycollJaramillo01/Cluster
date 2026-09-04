'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PublicUser, UserStatus } from '@/lib/careers/types';
import { btnQuiet, btnSolid, inputClass, paperCard } from './shared';

export function TeamPanel({
  onNameSaved,
}: {
  onNameSaved?: (email: string, name: string) => void;
}) {
  const t = useTranslations('CareersAdmin');
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    const response = await fetch('/api/careers/users', { cache: 'no-store' });
    if (!response.ok) return;
    const data = (await response.json()) as { users?: PublicUser[] };
    const list = data.users ?? [];
    setUsers(list);
    setDrafts(Object.fromEntries(list.map((item) => [item.email, item.name])));
  }

  useEffect(() => {
    void load();
  }, []);

  const pending = useMemo(
    () => users.filter((item) => item.status === 'pending'),
    [users],
  );
  const rest = useMemo(
    () => users.filter((item) => item.status !== 'pending'),
    [users],
  );

  async function patch(email: string, body: { name?: string; status?: UserStatus }) {
    setBusy(email + (body.status || 'name'));
    setNotice('');
    const response = await fetch('/api/careers/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...body }),
    });
    const data = (await response.json()) as { user?: PublicUser; error?: string };
    setBusy('');
    if (!response.ok || !data.user) return;
    setUsers((list) => list.map((item) => (item.email === data.user?.email ? data.user : item)));
    if (body.name && data.user) onNameSaved?.(data.user.email, data.user.name);
    if (body.status === 'approved') setNotice(t('userApproved'));
    else if (body.status === 'rejected') setNotice(t('userRejected'));
    else if (body.name) setNotice(t('nameSaved'));
  }

  return (
    <div className="space-y-8">
      {notice ? <p className="text-sm text-ink-700">{notice}</p> : null}

      <div className={paperCard}>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {t('pendingUsers')} · {pending.length}
      </p>
      {pending.length === 0 ? (
        <p className="mt-3 text-sm text-faint">{t('noPending')}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {pending.map((user) => (
            <li
              key={user.email}
              className="flex flex-col gap-3 border border-ink-950/10 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold uppercase text-ink-950">
                  {user.name || user.email}
                </p>
                <p className="truncate text-sm text-muted">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => patch(user.email, { status: 'approved' })}
                  className={btnSolid}
                >
                  {t('approve')}
                </button>
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => patch(user.email, { status: 'rejected' })}
                  className={btnQuiet}
                >
                  {t('reject')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>

      <div className={paperCard}>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {t('approvedUsers')} · {rest.length}
      </p>
      <ul className="mt-4 space-y-3">
        {rest.map((user) => (
          <li
            key={user.email}
            className="grid gap-3 border border-ink-950/10 p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="min-w-0">
              <p className="text-sm text-muted">
                {user.email}
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em]">
                  {user.role === 'owner' ? t('roleOwner') : t('roleMember')}
                  {' · '}
                  {user.status === 'rejected' ? t('statusRejected') : t('statusApproved')}
                </span>
              </p>
              <input
                value={drafts[user.email] ?? ''}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [user.email]: event.target.value }))
                }
                placeholder={t('namePlaceholder')}
                className={`${inputClass} mt-2`}
              />
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                disabled={Boolean(busy) || (drafts[user.email] ?? '').trim() === user.name}
                onClick={() => patch(user.email, { name: drafts[user.email] })}
                className={btnSolid}
              >
                {t('saveName')}
              </button>
              {user.role !== 'owner' && user.status === 'rejected' ? (
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => patch(user.email, { status: 'approved' })}
                  className={btnQuiet}
                >
                  {t('approve')}
                </button>
              ) : null}
              {user.role !== 'owner' && user.status === 'approved' ? (
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => patch(user.email, { status: 'rejected' })}
                  className={btnQuiet}
                >
                  {t('reject')}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
