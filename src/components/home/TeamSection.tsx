'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

const memberImages = [
  '/assets/stock/equipo-home/orlando-garcia.jpg',
  '/assets/stock/equipo-home/isabel-pinto.jpg',
  '/assets/stock/equipo-home/daniela-jimenez.jpg',
  '/assets/stock/equipo-home/maria-galicia.jpg',
  '/assets/stock/equipo-home/maycoll-jaramillo.jpg',
  '/assets/stock/equipo-home/maria-fernanda-garcia.jpg',
] as const;

const MASONRY_ASPECTS = [
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[5/6]',
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[5/6]',
] as const;

function MemberCard({
  member,
  duplicate = false,
  aspectClass = 'aspect-[4/5]',
  compact = false,
}: {
  member: { name: string; role: string; image: string };
  duplicate?: boolean;
  aspectClass?: string;
  compact?: boolean;
}) {
  return (
    <div
      className="overflow-hidden bg-surface transition-colors duration-300 hover:bg-surface-2"
      aria-hidden={duplicate || undefined}
    >
      <div className={`relative overflow-hidden bg-ink-950 ${aspectClass}`}>
        <Image
          src={member.image}
          alt={duplicate ? '' : `${member.name}, ${member.role}`}
          fill
          sizes={compact ? '50vw' : '260px'}
          className="object-cover object-top transition duration-700 hover:scale-105"
        />
      </div>
      <div className={compact ? 'p-3' : 'p-5'}>
        <h3
          className={`font-display font-semibold uppercase leading-tight text-fg ${
            compact ? 'text-sm' : 'text-lg sm:text-xl'
          }`}
        >
          {member.name}
        </h3>
        <p className={`mono-label text-accent ${compact ? 'mt-1.5' : 'mt-2'}`}>
          {member.role}
        </p>
      </div>
    </div>
  );
}

function TeamStrip({
  members,
  duplicate = false,
}: {
  members: { name: string; role: string; image: string }[];
  duplicate?: boolean;
}) {
  return (
    <ul className="flex shrink-0 gap-5 pr-5" aria-hidden={duplicate}>
      {members.map((member) => (
        <li
          key={`${duplicate ? 'dup-' : ''}${member.name}`}
          className="w-[220px] shrink-0 sm:w-[260px]"
        >
          <MemberCard member={member} duplicate={duplicate} />
        </li>
      ))}
    </ul>
  );
}

export function TeamSection() {
  const t = useTranslations('Team');
  const tc = useTranslations('Common');
  const members = (t.raw('members') as { name: string; role: string }[]).map(
    (member, index) => ({
      ...member,
      image: memberImages[index] ?? memberImages[0],
    }),
  );

  return (
    <Section tone="dark">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow={t('eyebrow')}
          tone="light"
          title={t('title')}
          description={t('description')}
        />
        <Button href="/sobre-cluster" variant="ghost" iconRight="arrow-right">
          {tc('aboutCluster')}
        </Button>
      </div>

      <div
        aria-label={tc('teamCarouselAria')}
        className="relative mt-14"
        role="region"
      >
        <ul className="columns-2 gap-3 md:hidden">
          {members.map((member, index) => (
            <li key={member.name} className="mb-3 break-inside-avoid">
              <MemberCard
                member={member}
                aspectClass={MASONRY_ASPECTS[index % MASONRY_ASPECTS.length]}
                compact
              />
            </li>
          ))}
        </ul>

        <div className="relative hidden overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:block">
          <div className="flex w-max animate-marquee [--marquee-duration:40s] hover:[animation-play-state:paused] motion-reduce:animate-none">
            <TeamStrip members={members} />
            <div className="motion-reduce:hidden">
              <TeamStrip members={members} duplicate />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
