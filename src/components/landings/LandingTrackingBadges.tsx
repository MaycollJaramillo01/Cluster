import { Reveal } from '@/components/ui/Reveal';

const tools = [
  {
    name: 'Meta Pixel',
    mark: 'Me',
    note: 'Facebook / Instagram Ads',
  },
  {
    name: 'Google Analytics',
    mark: 'GA',
    note: 'Medición de conversiones',
  },
] as const;

/** Logos / marcas de medición — dos columnas simétricas. */
export function LandingTrackingBadges({ className = '' }: { className?: string }) {
  return (
    <Reveal className={`mt-10 ${className}`}>
      <p className="mono-label text-center text-faint">Medición incluida</p>
      <div className="mx-auto mt-5 grid max-w-2xl gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="flex h-full items-center gap-3 border border-line bg-paper px-5 py-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-ink-950 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
              {tool.mark}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{tool.name}</p>
              <p className="text-xs text-muted">{tool.note}</p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
