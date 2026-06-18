'use client';

import { useEffect, useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';

type Pillar = {
  n: string;
  title: string;
  items: string[];
};

// Cuatro pilares que orbitan el núcleo "Un solo sistema".
const pillars: Pillar[] = [
  {
    n: '01',
    title: 'Marca & Branding',
    items: ['Identidad visual', 'Manual de marca', 'Posicionamiento'],
  },
  {
    n: '02',
    title: 'Campañas & Ads',
    items: ['Meta Ads', 'Google Ads', 'KPIs reales'],
  },
  {
    n: '03',
    title: 'Automatización & CRM',
    items: ['Workflows', 'Lead scoring', 'Seguimiento'],
  },
  {
    n: '04',
    title: 'Contenido & Web',
    items: ['Website', 'Landing pages', 'SEO'],
  },
];

// ── Geometría de la brújula (viewBox 600×600, centro 300,300) ──
const C = 300;

// Redondeamos para evitar discrepancias de punto flotante entre SSR y cliente.
const round = (n: number) => Math.round(n * 100) / 100;

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: round(C + r * Math.sin(a)), y: round(C - r * Math.cos(a)) };
};

// 72 marcas (cada 5°); las mayores cada 30°.
const ticks = Array.from({ length: 72 }, (_, i) => {
  const deg = i * 5;
  const major = i % 6 === 0;
  const inner = polar(major ? 258 : 268, deg);
  const outer = polar(283, deg);
  return { ...{ x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y }, major, deg };
});

// Rutas de los cuatro ejes (pulsos que convergen al núcleo).
const axes = [
  'M300,78 L300,226', // N
  'M522,300 L374,300', // E
  'M300,522 L300,374', // S
  'M78,300 L226,300', // W
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Compass({ motion, className }: { motion: boolean; className: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="needle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Resplandor del núcleo */}
      <circle cx={C} cy={C} r="120" fill="url(#coreGlow)">
        {motion && (
          <animate
            attributeName="opacity"
            values="0.55;1;0.55"
            dur="5s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Anillos concéntricos base */}
      {[283, 232, 178, 120].map((r) => (
        <circle
          key={r}
          cx={C}
          cy={C}
          r={r}
          fill="none"
          stroke="var(--fg)"
          strokeWidth="1"
          strokeOpacity="0.1"
        />
      ))}

      {/* Cruz de mira */}
      <line x1="20" y1={C} x2="580" y2={C} stroke="var(--fg)" strokeWidth="0.6" strokeOpacity="0.08" />
      <line x1={C} y1="20" x2={C} y2="580" stroke="var(--fg)" strokeWidth="0.6" strokeOpacity="0.08" />

      {/* Barrido de radar */}
      <g>
        {motion && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${C} ${C}`}
            to={`360 ${C} ${C}`}
            dur="7s"
            repeatCount="indefinite"
          />
        )}
        <path d="M300,300 L300,42 A258,258 0 0 1 497,135 Z" fill="url(#sweep)" />
        <line x1={C} y1={C} x2={C} y2="42" stroke="var(--accent)" strokeWidth="1.4" strokeOpacity="0.55" />
      </g>

      {/* Marcas de la brújula */}
      <g>
        {ticks.map((t) => (
          <line
            key={t.deg}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.deg % 90 === 0 ? 'var(--accent)' : 'var(--fg)'}
            strokeWidth={t.major ? 1.4 : 0.7}
            strokeOpacity={t.deg % 90 === 0 ? 0.7 : t.major ? 0.3 : 0.16}
          />
        ))}
      </g>

      {/* Anillo punteado exterior — gira en sentido horario */}
      <g>
        {motion && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${C} ${C}`}
            to={`360 ${C} ${C}`}
            dur="34s"
            repeatCount="indefinite"
          />
        )}
        <circle
          cx={C}
          cy={C}
          r="232"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.2"
          strokeOpacity="0.5"
          strokeDasharray="2 12"
        />
        {/* Punto en órbita exterior */}
        <circle cx={C} cy={C - 232} r="3.5" fill="var(--accent)" />
      </g>

      {/* Anillo interior — gira en sentido antihorario */}
      <g>
        {motion && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`360 ${C} ${C}`}
            to={`0 ${C} ${C}`}
            dur="26s"
            repeatCount="indefinite"
          />
        )}
        <circle
          cx={C}
          cy={C}
          r="178"
          fill="none"
          stroke="var(--fg)"
          strokeWidth="1"
          strokeOpacity="0.22"
          strokeDasharray="1 16"
        />
        <circle cx={C} cy={C - 178} r="2.5" fill="var(--fg)" fillOpacity="0.5" />
        <circle cx={C + 178} cy={C} r="2.5" fill="var(--accent)" />
      </g>

      {/* Aguja de la brújula — deriva lenta */}
      <g>
        {motion && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`-7 ${C} ${C}; 6 ${C} ${C}; -3 ${C} ${C}; 8 ${C} ${C}; -7 ${C} ${C}`}
            keyTimes="0;0.25;0.5;0.75;1"
            dur="14s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        )}
        <polygon points="300,170 308,300 292,300" fill="url(#needle)" />
        <polygon points="300,430 308,300 292,300" fill="var(--fg)" fillOpacity="0.12" />
        <circle cx={C} cy={C} r="5" fill="var(--accent)" />
        <circle cx={C} cy={C} r="9" fill="none" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.5" />
      </g>

      {/* Anillo de pulso del núcleo */}
      <circle cx={C} cy={C} r="70" fill="none" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.3">
        {motion && (
          <>
            <animate attributeName="r" values="68;88;68" dur="4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="4s" repeatCount="indefinite" />
          </>
        )}
      </circle>

      {/* Pulsos de datos convergiendo al núcleo */}
      {motion &&
        axes.map((d, i) => (
          <circle key={d} r="3.5" fill="var(--accent)">
            <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${i * 0.65}s`} path={d} />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.15;0.8;1"
              dur="2.6s"
              repeatCount="indefinite"
              begin={`${i * 0.65}s`}
            />
          </circle>
        ))}
    </svg>
  );
}

function Core() {
  return (
    <div className="relative z-20 flex aspect-square w-40 flex-col items-center justify-center border border-accent/40 bg-ink-950/70 p-4 text-center backdrop-blur-sm sm:w-48 lg:w-52">
      <span className="pointer-events-none absolute -inset-px border border-accent/15" />
      {/* Marcas de esquina tipo visor */}
      {['-top-px -left-px border-t border-l', '-top-px -right-px border-t border-r', '-bottom-px -left-px border-b border-l', '-bottom-px -right-px border-b border-r'].map(
        (pos) => (
          <span key={pos} className={`pointer-events-none absolute h-3 w-3 border-accent ${pos}`} />
        ),
      )}
      <span className="mono-label text-faint">Un solo</span>
      <span className="font-display text-2xl font-bold uppercase leading-none text-fg sm:text-3xl">
        Sistema
      </span>
      <span className="mt-2 mono-label text-accent">Cluster</span>
    </div>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div className="group relative w-full max-w-[16rem] border-t border-line bg-ink-950/40 p-5 backdrop-blur-sm transition-colors duration-500 hover:border-accent/60 md:bg-transparent md:backdrop-blur-none">
      <span className="pointer-events-none absolute -top-px left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-accent">{pillar.n}</span>
        <h3 className="font-display text-base font-bold uppercase leading-none tracking-tight text-fg sm:text-lg">
          {pillar.title}
        </h3>
      </div>
      <ul className="mt-3 space-y-1">
        {pillar.items.map((item) => (
          <li
            key={item}
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors duration-300 group-hover:text-fg"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EcosystemDiagram() {
  const reduced = useReducedMotion();

  return (
    <Reveal className="relative mx-auto mt-16 w-full max-w-4xl">
      {/* Brújula / radar (md+) */}
      <Compass
        motion={!reduced}
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 hidden h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2 md:block"
      />

      {/* Versión radial (md+) */}
      <div className="relative z-10 hidden grid-cols-3 grid-rows-3 place-items-center gap-4 md:grid">
        <div className="col-start-2 row-start-1 flex justify-center">
          <PillarCard pillar={pillars[0]} />
        </div>
        <div className="col-start-1 row-start-2 flex justify-end">
          <PillarCard pillar={pillars[3]} />
        </div>
        <div className="col-start-2 row-start-2">
          <Core />
        </div>
        <div className="col-start-3 row-start-2 flex justify-start">
          <PillarCard pillar={pillars[1]} />
        </div>
        <div className="col-start-2 row-start-3 flex justify-center">
          <PillarCard pillar={pillars[2]} />
        </div>
      </div>

      {/* Versión móvil: brújula animada + pilares apilados */}
      <div className="md:hidden">
        <div className="relative mx-auto aspect-square w-full max-w-[20rem]">
          <Compass
            motion={!reduced}
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Core />
          </div>
        </div>
        <div className="mt-10 w-full space-y-3">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.n} pillar={pillar} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
