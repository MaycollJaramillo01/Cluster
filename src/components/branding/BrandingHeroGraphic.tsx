const BRANDING_HERO_STYLES = `
  .branding-svg [class^="brand-"] { transform-box: fill-box; }

  .brand-draw {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: brand-draw 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .brand-fade {
    opacity: 0;
    animation: brand-fade 0.6s ease-out forwards;
  }

  .brand-pulse {
    transform-origin: center;
    animation: brand-pulse 2.4s ease-in-out infinite;
  }

  .brand-cursor {
    animation: brand-cursor 4.2s ease-in-out infinite;
  }

  @keyframes brand-draw { to { stroke-dashoffset: 0; } }
  @keyframes brand-fade { to { opacity: 1; } }
  @keyframes brand-pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.3); opacity: 1; }
  }
  @keyframes brand-cursor {
    0%, 100% { transform: translate(0, 0); }
    40% { transform: translate(120px, 36px); }
    75% { transform: translate(42px, 114px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .branding-svg [class^="brand-"] {
      animation: none !important;
      stroke-dashoffset: 0 !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

export function BrandingHeroGraphic() {
  return (
    <div className="relative h-full w-full bg-ink-950 text-white">
      <svg
        viewBox="0 0 720 900"
        role="img"
        aria-label="Ilustracion vectorial animada de construccion de logo e identidad de marca"
        className="branding-svg h-full w-full"
      >
        <defs>
          <style dangerouslySetInnerHTML={{ __html: BRANDING_HERO_STYLES }} />
          <linearGradient id="brandAccent" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#02C39A" />
            <stop offset="100%" stopColor="#B8FFF0" />
          </linearGradient>
          <linearGradient id="brandPanel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#202020" />
            <stop offset="100%" stopColor="#0B0B0B" />
          </linearGradient>
          <pattern id="brandGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="720" height="900" fill="#080808" />
        <rect width="720" height="900" fill="url(#brandGrid)" opacity="0.6" />
        <rect x="52" y="104" width="616" height="698" fill="none" stroke="rgba(255,255,255,0.16)" />

        <g transform="translate(82 76)">
          <rect width="556" height="76" fill="#F9F9F9" />
          <text x="26" y="32" fill="#111111" fontFamily="Consolas, monospace" fontSize="13" fontWeight="700" letterSpacing="4">
            BRAND IDENTITY STUDIO
          </text>
          <text x="26" y="56" fill="rgba(17,17,17,0.62)" fontFamily="Consolas, monospace" fontSize="11" letterSpacing="2">
            LOGO / COLOR / TYPOGRAPHY
          </text>
        </g>

        <g transform="translate(82 188)">
          <rect width="326" height="286" fill="url(#brandPanel)" />
          <rect x="1" y="1" width="324" height="284" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="22" y="34" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="12" letterSpacing="3">
            LOGO CONSTRUCTION
          </text>

          <circle cx="162" cy="158" r="96" fill="none" stroke="rgba(255,255,255,0.1)" />
          <circle cx="162" cy="158" r="62" fill="none" stroke="rgba(255,255,255,0.1)" />
          <line x1="66" y1="158" x2="258" y2="158" stroke="rgba(255,255,255,0.18)" />
          <line x1="162" y1="62" x2="162" y2="254" stroke="rgba(255,255,255,0.18)" />

          <path
            className="brand-draw"
            pathLength={100}
            d="M112 212 L162 92 L212 212 H188 L178 186 H146 L136 212 Z"
            fill="none"
            stroke="url(#brandAccent)"
            strokeWidth="8"
            strokeLinecap="square"
          />
          <rect className="brand-fade" style={{ animationDelay: '0.5s' }} x="146" y="192" width="32" height="16" fill="#02C39A" />

          <g className="brand-cursor" transform="translate(112 126)">
            <path d="M0 0 L0 22 L6 16 L12 28 L16 26 L10 14 L18 14 Z" fill="#F9F9F9" />
          </g>
        </g>

        <g transform="translate(438 188)">
          <rect width="200" height="136" fill="url(#brandPanel)" />
          <rect x="1" y="1" width="198" height="134" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="34" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="11" letterSpacing="3">
            PALETTE
          </text>
          {['#02C39A', '#111111', '#F9F9F9', '#4A4A4A'].map((c, i) => (
            <rect
              key={c}
              className="brand-fade"
              style={{ animationDelay: `${0.4 + i * 0.12}s` }}
              x={20 + i * 44}
              y="58"
              width="32"
              height="32"
              fill={c}
            />
          ))}
        </g>

        <g transform="translate(438 338)">
          <rect width="200" height="136" fill="url(#brandPanel)" />
          <rect x="1" y="1" width="198" height="134" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="34" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="11" letterSpacing="3">
            TYPOGRAPHY
          </text>
          <text className="brand-fade" style={{ animationDelay: '0.6s' }} x="20" y="72" fill="#F9F9F9" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700">
            BRAND
          </text>
          <text className="brand-fade" style={{ animationDelay: '0.75s' }} x="20" y="98" fill="rgba(255,255,255,0.62)" fontFamily="Consolas, monospace" fontSize="12" letterSpacing="2">
            MODERN / CLARO / SERIO
          </text>
        </g>

        <g transform="translate(82 504)">
          <rect width="556" height="120" fill="url(#brandPanel)" />
          <rect x="1" y="1" width="554" height="118" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="34" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="11" letterSpacing="3">
            APPLICATIONS
          </text>
          {['LOGO', 'ICON', 'SOCIAL KIT', 'BRAND GUIDE'].map((label, i) => (
            <g key={label}>
              <rect
                className="brand-fade"
                style={{ animationDelay: `${0.7 + i * 0.14}s` }}
                x={20 + i * 134}
                y="52"
                width="116"
                height="44"
                fill="rgba(255,255,255,0.06)"
              />
              <text x={30 + i * 134} y="79" fill="rgba(255,255,255,0.75)" fontFamily="Consolas, monospace" fontSize="10" letterSpacing="2">
                {label}
              </text>
            </g>
          ))}
        </g>

        <g transform="translate(82 652)">
          <rect width="556" height="134" fill="url(#brandPanel)" />
          <rect x="1" y="1" width="554" height="132" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="34" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="11" letterSpacing="3">
            BRAND CONFIDENCE
          </text>
          <text x="20" y="88" fill="#F9F9F9" fontFamily="Arial Narrow, Impact, sans-serif" fontSize="52" fontWeight="800">
            96%
          </text>
          <text x="180" y="72" fill="#02C39A" fontFamily="Consolas, monospace" fontSize="12" letterSpacing="2">
            PERCEPCION PROFESIONAL
          </text>
          <circle className="brand-pulse" cx="518" cy="66" r="8" fill="#02C39A" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden="true" />
    </div>
  );
}
