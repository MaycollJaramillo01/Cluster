import Link from 'next/link';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
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
    <Page className="gap-5">
      <Heading level={1} className="academy-title">Retos</Heading>
      {personId ? <p className="w-fit rounded-academy bg-academy-tint px-3 py-2 text-sm font-semibold text-academy-primary">Nivel {levelFor(xp)} · {xp} XP</p> : null}
      {query.ok ? <p role="status" className="academy-notice">Listo, el bono ya está en tu XP.</p> : null}
      {query.error === 'falta' ? <p role="alert" className="academy-notice">Todavía no llegas a la meta de ese reto.</p> : null}
      {query.error === 'cerrado' ? <p role="alert" className="academy-notice">Ese reto ya cerró.</p> : null}
      {!personId ? (
        <p className="mt-4 text-sm text-black/60">
          <Link className="underline" href="/academia/entrar">Entra</Link> para ver tu avance en los retos.
        </p>
      ) : null}
      {challenges.length === 0 ? <p className="academy-panel p-5 text-academy-muted">No hay retos abiertos ahora.</p> : (
        <Grid columns={{ minWidth: 250, max: 2 }} gap={4}>
          {challenges.map((item, index) => {
            const mine = progress[index];
            const done = claimed.has(item.id);
            const pct = mine && mine.goal ? Math.min(100, Math.round((mine.value / mine.goal) * 100)) : 0;
            return (
              <Card key={item.id} padding={5} className="space-y-4">
                <VStack gap={2}>
                  <Heading level={2} className="text-xl font-bold">{item.title}</Heading>
                  {item.description ? <p className="text-sm text-academy-muted">{item.description}</p> : null}
                  <p className="text-sm font-medium text-academy-primary">
                    +{item.bonus_xp} XP{item.course_title ? ` · ${item.course_title}` : ''}{item.ends_at ? ` · cierra el ${formatDate(item.ends_at)}` : ''}
                  </p>
                </VStack>
                {mine ? (
                  <VStack gap={2}>
                    <ProgressBar label={`Avance en ${item.title}`} value={pct} isLabelHidden />
                    <p className="text-sm text-academy-muted">{mine.value} de {mine.goal} {UNIT[item.kind]}</p>
                  </VStack>
                ) : null}
                {done ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">Bono reclamado</p>
                ) : mine?.met ? (
                  <form action={claimChallenge}>
                    <input type="hidden" name="id" value={item.id} />
                    <AcademySubmit label={`Reclamar ${item.bonus_xp} XP`} pending="Guardando…" />
                  </form>
                ) : null}
              </Card>
            );
          })}
        </Grid>
      )}
    </Page>
  );
}
