import Image from 'next/image';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

const members = [
  {
    name: 'Orlando García',
    role: 'Director de agencia',
    image: '/assets/stock/equipo-home/orlando-garcia.jpg',
  },
  {
    name: 'Isabel Pinto',
    role: 'Account Manager',
    image: '/assets/stock/equipo-home/isabel-pinto.jpg',
  },
  {
    name: 'Daniela Jiménez',
    role: 'Account Manager',
    image: '/assets/stock/equipo-home/daniela-jimenez.jpg',
  },
  {
    name: 'María Galicia',
    role: 'Account Manager',
    image: '/assets/stock/equipo-home/maria-galicia.jpg',
  },
  {
    name: 'Maycoll Jaramillo',
    role: 'Desarrollador web senior',
    image: '/assets/stock/equipo-home/maycoll-jaramillo.jpg',
  },
  {
    name: 'María Fernanda García',
    role: 'Account Manager',
    image: '/assets/stock/equipo-home/maria-fernanda-garcia.jpg',
  },
] as const;

function MemberCard({
  member,
  duplicate = false,
}: {
  member: (typeof members)[number];
  duplicate?: boolean;
}) {
  return (
    <li className="w-[220px] shrink-0 sm:w-[260px]" aria-hidden={duplicate}>
      <div className="overflow-hidden bg-surface transition-colors duration-300 hover:bg-surface-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-950">
          <Image
            src={member.image}
            alt={duplicate ? '' : `${member.name}, ${member.role}`}
            fill
            sizes="260px"
            className="object-cover object-top transition duration-700 hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold uppercase leading-tight text-fg sm:text-xl">
            {member.name}
          </h3>
          <p className="mono-label mt-2 text-accent">{member.role}</p>
        </div>
      </div>
    </li>
  );
}

function TeamStrip({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="flex shrink-0 gap-5 pr-5" aria-hidden={duplicate}>
      {members.map((member) => (
        <MemberCard
          key={`${duplicate ? 'dup-' : ''}${member.name}`}
          member={member}
          duplicate={duplicate}
        />
      ))}
    </ul>
  );
}

export function TeamSection() {
  return (
    <Section tone="dark">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Equipo"
          tone="light"
          title="Conoce a nuestro equipo."
          description="Un equipo multidisciplinario de más de 16 personas en toda LATAM, unido para hacer crecer tu marca."
        />
        <Button href="/sobre-cluster" variant="ghost" iconRight="arrow-right">
          Sobre Cluster
        </Button>
      </div>

      <div
        aria-label="Carrusel del equipo Cluster Media"
        className="relative mt-14 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        role="region"
      >
        <div className="flex w-max animate-marquee [--marquee-duration:40s] hover:[animation-play-state:paused] motion-reduce:animate-none">
          <TeamStrip />
          <div className="motion-reduce:hidden">
            <TeamStrip duplicate />
          </div>
        </div>
      </div>
    </Section>
  );
}
