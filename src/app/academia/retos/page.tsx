import Link from 'next/link';
import { Page } from '@/components/academia/ui';
import { formatDate } from '@/lib/crm/format';
import { claimChallenge } from '@/lib/valux/actions';
import { challengeProgress, claimedChallenges, listChallenges } from '@/lib/valux/challenges';
import { personXp } from '@/lib/valux/data';
import { levelFor } from '@/lib/valux/mission';
import { academiaPersonId } from '@/lib/valux/session';

export const dynamic = 'force-dynamic';

const UNIT = { xp: 'XP', misiones: 'misiones', curso: 'clases' } as const;

export default async function ChallengesPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const query = await searchParams;
  const personId = await academiaPersonId();
  const [challenges, claimed, xp] = await Promise.all([listChallenges(true), claimedChallenges(personId), personXp(personId)]);
  const progress = personId ? await Promise.all(challenges.map((item) => challengeProgress(personId, item))) : [];

  return (
    <Page>
      <h1 className="font-display text-5xl tracking-wide">Retos</h1>
      {personId ? <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-black/55">Nivel {levelFor(xp)} · {xp} XP</p> : null}
      {query.ok ? <p className="mt-4 text-sm">Listo, el bono ya está en tu XP.</p> : null}
      {query.error === 'falta' ? <p className="mt-4 text-sm">Todavía no llegas a la meta de ese reto.</p> : null}
      {query.error === 'cerrado' ? <p className="mt-4 text-sm">Ese reto ya cerró.</p> : null}
      {!personId ? (
        <p className="mt-4 text-sm text-black/60">
          <Link className="underline" href="/academia/entrar">Entra</Link> para ver tu avance en los retos.
        </p>
      ) : null}
      {challenges.length === 0 ? <p className="mt-6 text-sm text-black/60">No hay retos abiertos ahora.</p> : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {challenges.map((item, index) => {
            const mine = progress[index];
            const done = claimed.has(item.id);
            const pct = mine && mine.goal ? Math.min(100, Math.round((mine.value / mine.goal) * 100)) : 0;
            return (
              <article key={item.id} className="space-y-3 border border-black/10 bg-white p-4">
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.description ? <p className="text-sm text-black/60">{item.description}</p> : null}
                  <p className="mt-1 text-xs text-black/45">
                    +{item.bonus_xp} XP{item.course_title ? ` · ${item.course_title}` : ''}{item.ends_at ? ` · cierra el ${formatDate(item.ends_at)}` : ''}
                  </p>
                </div>
                {mine ? (
                  <div>
                    <div className="h-1 bg-black/10"><span className="block h-1 bg-brand" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-2 text-xs text-black/45">{mine.value} de {mine.goal} {UNIT[item.kind]}</p>
                  </div>
                ) : null}
                {done ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">Bono reclamado</p>
                ) : mine?.met ? (
                  <form action={claimChallenge}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Reclamar {item.bonus_xp} XP</button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </Page>
  );
}
