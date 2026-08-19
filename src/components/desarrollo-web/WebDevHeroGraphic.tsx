const HERO_STYLES = `
  .web-svg [class^="web-"] { transform-box: fill-box; }

  .web-type {
    transform-origin: left;
    transform: scaleX(0);
    animation: web-type 4.8s steps(28, end) infinite;
  }

  .web-type-slow {
    transform-origin: left;
    transform: scaleX(0);
    animation: web-type 6.2s steps(34, end) infinite;
  }

  .web-caret {
    animation: web-caret 1s steps(1, end) infinite;
  }

  .web-scroll {
    animation: web-scroll 8s ease-in-out infinite;
  }

  .web-glow {
    animation: web-glow 3s ease-in-out infinite;
  }

  @keyframes web-type {
    0% { transform: scaleX(0); }
    45% { transform: scaleX(1); }
    70% { transform: scaleX(1); }
    100% { transform: scaleX(0); }
  }

  @keyframes web-caret {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }

  @keyframes web-scroll {
    0%, 25% { transform: translateY(0); }
    50%, 75% { transform: translateY(-72px); }
    100% { transform: translateY(0); }
  }

  @keyframes web-glow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.55; }
  }

  @media (prefers-reduced-motion: reduce) {
    .web-svg [class^="web-"] {
      animation: none !important;
      transform: none !important;
      opacity: 1 !important;
    }
  }
`;

export function WebDevHeroGraphic() {
  return (
    <div className="relative h-full w-full bg-ink-950 text-white">
      <svg
        viewBox="0 0 720 900"
        role="img"
        aria-label="Fondo animado simulando escritura de codigo de desarrollo web"
        className="web-svg h-full w-full"
      >
        <defs>
          <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
          <linearGradient id="webPanel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1B1B1B" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </linearGradient>
          <pattern id="webGrid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="720" height="900" fill="#080808" />
        <rect width="720" height="900" fill="url(#webGrid)" opacity="0.55" />
        <rect x="52" y="104" width="616" height="698" fill="none" stroke="rgba(255,255,255,0.16)" />

        <g transform="translate(82 76)">
          <rect width="556" height="76" fill="#F9F9F9" />
          <text x="28" y="32" fill="#111111" fontFamily="Consolas, monospace" fontSize="13" fontWeight="700" letterSpacing="4">
            WEB CODE EDITOR
          </text>
          <text x="28" y="56" fill="rgba(17,17,17,0.62)" fontFamily="Consolas, monospace" fontSize="11" letterSpacing="2">
            HTML / CSS / JS / API
          </text>
        </g>

        <g transform="translate(82 188)">
          <rect width="556" height="614" fill="url(#webPanel)" />
          <rect x="1" y="1" width="554" height="612" fill="none" stroke="rgba(255,255,255,0.14)" />

          <rect x="0" y="0" width="556" height="44" fill="rgba(255,255,255,0.04)" />
          <circle cx="22" cy="22" r="6" fill="#02C39A" />
          <circle cx="42" cy="22" r="6" fill="rgba(255,255,255,0.35)" />
          <circle cx="62" cy="22" r="6" fill="rgba(255,255,255,0.2)" />
          <text x="88" y="26" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">home.tsx</text>

          <g className="web-scroll" transform="translate(0 0)">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
              <g key={row} transform={`translate(0 ${62 + row * 52})`}>
                <text x="18" y="14" fill="rgba(255,255,255,0.28)" fontFamily="Consolas, monospace" fontSize="10">
                  {String(row + 1).padStart(2, '0')}
                </text>
                <rect x="44" y="6" width="470" height="10" fill="rgba(255,255,255,0.06)" />
                <rect
                  className={row % 2 === 0 ? 'web-type' : 'web-type-slow'}
                  style={{ animationDelay: `${row * 0.28}s` }}
                  x="44"
                  y="6"
                  width={row % 3 === 0 ? 410 : row % 3 === 1 ? 320 : 250}
                  height="10"
                  fill={row % 4 === 0 ? '#02C39A' : 'rgba(184,255,240,0.8)'}
                />
                <rect className="web-caret" x={350 + (row % 4) * 24} y="4" width="2" height="14" fill="#02C39A" />
                <rect x="74" y="24" width="280" height="7" fill="rgba(255,255,255,0.14)" />
              </g>
            ))}
          </g>

          <rect className="web-glow" x="20" y="548" width="516" height="42" fill="rgba(2,195,154,0.12)" />
          <text x="30" y="573" fill="#02C39A" fontFamily="Consolas, monospace" fontSize="11" letterSpacing="2">
            COMPILANDO CAMBIOS... BUILD OK
          </text>
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden="true" />
    </div>
  );
}
