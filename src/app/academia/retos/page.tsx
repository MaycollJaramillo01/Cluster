import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { claimChallenge } from '@/lib/valux/actions';
import { challengeProgress, claimedChallenges, listChallenges, type Challenge } from '@/lib/valux/challenges';
import { personXp } from '@/lib/valux/data';
import { levelFor } from '@/lib/valux/mission';
import { academiaPersonId } from '@/lib/valux/session';

export const dynamic = 'force-dynamic';

const UNIT = { xp: 'XP', misiones: 'misiones', curso: 'clases' } as const;
type Progress = Awaited<ReturnType<typeof challengeProgress>>;
type Row = { item: Challenge; mine?: Progress; claimed: boolean };

function ChallengeRow({ item, mine, claimed }: Row) {
  const pct = mine && mine.goal ? Math.min(100, Math.round((mine.value / mine.goal) * 100)) : 0;
  const meta = [item.course_title, item.ends_at ? `Cierra el ${formatDate(item.ends_at)}` : ''].filter(Boolean).join(' · ');
  return (
    <li className="grid gap-4 p-5 sm:grid-cols-[1fr_theme(spacing.48)] sm:items-center sm:gap-8 sm:p-6">
      <VStack gap={3} className="min-w-0">
        <VStack gap={1}>
          <HStack gap={3} align="center" wrap="wrap">
            <Heading level={3} className="break-words text-lg font-bold">{item.title}</Heading>
            <strong className="rounded-academy-full bg-academy-tint px-2.5 py-0.5 text-xs font-semibold text-academy-primary">+{item.bonus_xp} XP</strong>
          </HStack>
          {item.description ? <p className="text-sm text-academy-muted">{item.description}</p> : null}
          {meta ? <p className="text-xs font-semibold text-academy-muted">{meta}</p> : null}
        </VStack>
        {mine ? (
          <VStack gap={1}>
            <ProgressBar label={`Avance en ${item.title}`} value={pct} isLabelHidden />
            <p className="text-sm tabular-nums text-academy-muted">{Math.min(mine.value, mine.goal)} de {mine.goal} {UNIT[item.kind]}</p>
          </VStack>
        ) : null}
      </VStack>
      <VStack gap={2} className="sm:items-end">
        {claimed ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-academy-primary"><Icon name="check" size={16} />Bono reclamado</p>
        ) : mine?.met ? (
          <form action={claimChallenge}>
            <input type="hidden" name="id" value={item.id} />
            <AcademySubmit label={`Reclamar ${item.bonus_xp} XP`} pending="Guardando…" />
          </form>
        ) : mine ? (
          <p className="text-sm text-academy-muted">Te faltan {Math.max(0, mine.goal - mine.value)} {UNIT[item.kind]}</p>
        ) : null}
      </VStack>
    </li>
  );
}

function Group({ id, title, rows }: { id: string; title: string; rows: Row[] }) {
  if (!rows.length) return null;
  return (
    <VStack as="section" gap={4} aria-labelledby={id}>
      <Heading level={2} id={id} className="text-xl font-bold">{title} <small className="text-base font-semibold text-academy-muted">({rows.length})</small></Heading>
      <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
        {rows.map((row) => <ChallengeRow key={row.item.id} {...row} />)}
      </ul>
    </VStack>
  );
}

export default async function ChallengesPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const query = await searchParams;
  const personId = await academiaPersonId();
  const [challenges, claimed, xp] = await Promise.all([listChallenges(true), claimedChallenges(personId), personXp(personId)]);
  const progress = personId ? await Promise.all(challenges.map((item) => challengeProgress(personId, item))) : [];
  const rows: Row[] = challenges.map((item, index) => ({ item, mine: progress[index], claimed: claimed.has(item.id) }));
  const level = levelFor(xp);
  const inLevel = xp % 100;

  return (
    <main className="academy-page max-w-5xl space-y-8">
      <section className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <VStack as="header" gap={2}>
          <p className="text-sm font-semibold text-academy-primary">Retos</p>
          <Heading level={1} className="academy-title">Gana XP extra</Heading>
          <p className="max-w-prose text-academy-muted">Ganas XP al aprobar misiones en tus cursos. Cumple la meta de un reto y reclama su bono.</p>
        </VStack>
        {personId ? (
          <VStack gap={2} aria-label="Tu nivel" className="academy-hero min-w-64 rounded-academy-lg p-5 text-white">
            <HStack justify="between" align="end" gap={4}>
              <strong className="font-academy-heading text-2xl font-bold">Nivel {level}</strong>
              <small className="text-sm text-white/80 tabular-nums">{xp} XP</small>
            </HStack>
            <ProgressBar label="Avance al siguiente nivel" value={inLevel} isLabelHidden />
            <small className="text-xs text-white/80">{100 - inLevel} XP para el nivel {level + 1}</small>
          </VStack>
        ) : null}
      </section>

      {query.ok ? <p role="status" className="academy-notice flex items-center gap-2"><Icon name="check" size={16} className="text-academy-primary" />Listo, el bono ya está en tu XP.</p> : null}
      {query.error === 'falta' ? <p role="alert" className="academy-notice">Todavía no llegas a la meta de ese reto.</p> : null}
      {query.error === 'cerrado' ? <p role="alert" className="academy-notice">Ese reto ya cerró.</p> : null}

      {!personId ? (
        <HStack gap={4} align="center" justify="between" wrap="wrap" className="academy-panel p-5">
          <p className="font-semibold">Entra para ver tu avance en los retos.</p>
          <Link href="/academia/entrar" className="academy-action academy-action-primary">Entrar <Icon name="arrow-right" size={16} /></Link>
        </HStack>
      ) : null}

      {rows.length === 0 ? (
        <p className="academy-panel p-6 text-academy-muted">No hay retos abiertos ahora.</p>
      ) : personId ? (
        <>
          <Group id="retos-listos" title="Listos para reclamar" rows={rows.filter((row) => !row.claimed && row.mine?.met)} />
          <Group id="retos-pendientes" title="Por cumplir" rows={rows.filter((row) => !row.claimed && !row.mine?.met)} />
          <Group id="retos-reclamados" title="Bonos reclamados" rows={rows.filter((row) => row.claimed)} />
        </>
      ) : (
        <Group id="retos-abiertos" title="Retos abiertos" rows={rows} />
      )}
    </main>
  );
}
