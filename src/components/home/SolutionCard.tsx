import { Reveal } from '@/components/ui/Reveal';

export type SolutionVideo = {
  mp4: string;
  webm?: string;
  poster?: string;
};

type SolutionCardProps = {
  title: string;
  text: string;
  video?: SolutionVideo;
  index?: number;
};

export function SolutionCard({
  title,
  text,
  video,
  index = 0,
}: SolutionCardProps) {
  return (
    <Reveal
      delay={index * 70}
      className="group overflow-hidden bg-surface transition-all duration-300 hover:bg-surface-2"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-950">
        {video ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={video.poster}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          >
            {video.webm && <source src={video.webm} type="video/webm" />}
            <source src={video.mp4} type="video/mp4" />
          </video>
        ) : (
          <div className="grain absolute inset-0" aria-hidden="true" />
        )}
      </div>

      <div className="p-7">
        <h3 className="font-display text-lg font-semibold text-white">
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-white/60">
          {text}
        </p>
      </div>
    </Reveal>
  );
}
