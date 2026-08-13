const HERO_STYLES = `
  .web-svg [class^="web-"] { transform-box: fill-box; }

  .web-draw {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: web-draw 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .web-fade {
    opacity: 0;
    animation: web-fade 0.7s ease-out forwards;
  }

  .web-grow {
    transform-origin: bottom;
    transform: scaleY(0);
    animation: web-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .web-row {
    transform-origin: left;
    transform: scaleX(0);
    animation: web-grow-x 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .web-pulse {
    transform-origin: center;
    animation: web-pulse 2.4s ease-in-out infinite;
  }

  .web-blink {
    animation: web-blink 1.2s steps(1, end) infinite;
  }

  .web-live {
    animation: web-live 2.8s ease-in-out infinite;
  }

  .web-scan {
    animation: web-scan 4.6s ease-in-out infinite;
  }

  .web-cursor {
    animation: web-cursor 3.8s ease-in-out infinite;
  }

  @keyframes web-draw { to { stroke-dashoffset: 0; } }
  @keyframes web-fade { to { opacity: 1; } }
  @keyframes web-grow { to { transform: scaleY(1); } }
  @keyframes web-grow-x { to { transform: scaleX(1); } }
  @keyframes web-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.35); opacity: 0.7; }
  }
  @keyframes web-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  @keyframes web-live {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 1; }
  }
  @keyframes web-scan {
    0% { transform: translateY(0); opacity: 0; }
    12% { opacity: 0.7; }
    88% { opacity: 0.7; }
    100% { transform: translateY(268px); opacity: 0; }
  }
  @keyframes web-cursor {
    0%, 100% { transform: translate(0, 0); }
    35% { transform: translate(118px, 42px); }
    70% { transform: translate(36px, 128px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .web-svg [class^="web-"] {
      animation: none !important;
      stroke-dashoffset: 0 !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

const PAGE_WIDTHS = [72, 96, 64, 88, 80];

export function WebDevHeroGraphic() {
  return (
    <div className="relative h-full w-full bg-ink-950 text-white">
      <svg
        viewBox="0 0 720 900"
        role="img"
        aria-label="Sistema vectorial animado de desarrollo, mantenimiento y crecimiento web"
        className="web-svg h-full w-full"
      >
        <defs>
          <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
          <linearGradient id="webAccent" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#02C39A" />
            <stop offset="100%" stopColor="#B8FFF0" />
          </linearGradient>
          <linearGradient id="webPanel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#202020" />
            <stop offset="100%" stopColor="#0B0B0B" />
          </linearGradient>
          <linearGradient id="webScan" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#02C39A" stopOpacity="0" />
            <stop offset="50%" stopColor="#02C39A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#02C39A" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="webGrid"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          </pattern>
          <filter id="webGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="720" height="900" fill="#080808" />
        <rect width="720" height="900" fill="url(#webGrid)" opacity="0.55" />
        <path
          d="M52 104 H668 V802 H52 Z"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
        />

        <g transform="translate(82 76)">
          <rect width="556" height="76" fill="#F9F9F9" />
          <text
            x="28"
            y="32"
            fill="#111111"
            fontFamily="Consolas, monospace"
            fontSize="13"
            fontWeight="700"
            letterSpacing="4"
          >
            WEB SYSTEM VECTOR
          </text>
          <text
            x="28"
            y="56"
            fill="rgba(17,17,17,0.62)"
            fontFamily="Consolas, monospace"
            fontSize="11"
            letterSpacing="2"
          >
            BUILD / HOST / GROW / CONVERT
          </text>
        </g>

        {/* Browser */}
        <g transform="translate(82 188)">
          <rect width="556" height="318" fill="url(#webPanel)" />
          <rect
            x="1"
            y="1"
            width="554"
            height="316"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />
          <rect x="18" y="18" width="12" height="12" fill="#02C39A" />
          <rect x="38" y="18" width="12" height="12" fill="rgba(255,255,255,0.28)" />
          <rect x="58" y="18" width="12" height="12" fill="rgba(255,255,255,0.14)" />
          <rect x="88" y="16" width="330" height="16" fill="rgba(255,255,255,0.08)" />
          <text
            x="100"
            y="28"
            fill="rgba(255,255,255,0.45)"
            fontFamily="Consolas, monospace"
            fontSize="10"
            letterSpacing="2"
          >
            tu-negocio.com
          </text>
          <g className="web-live">
            <rect x="436" y="16" width="102" height="16" fill="#02C39A" />
            <text
              x="487"
              y="28"
              textAnchor="middle"
              fill="#111111"
              fontFamily="Consolas, monospace"
              fontSize="10"
              fontWeight="700"
              letterSpacing="2"
            >
              LIVE SSL
            </text>
          </g>

          <line
            x1="18"
            y1="46"
            x2="538"
            y2="46"
            stroke="rgba(255,255,255,0.12)"
          />

          <rect
            className="web-scan"
            x="18"
            y="54"
            width="520"
            height="28"
            fill="url(#webScan)"
          />

          {/* Nav */}
          {PAGE_WIDTHS.map((w, i) => (
            <rect
              key={w}
              className="web-row"
              style={{ animationDelay: `${0.2 + i * 0.08}s` }}
              x={18 + i * 84}
              y="62"
              width={w}
              height="10"
              fill={i === 0 ? '#02C39A' : 'rgba(255,255,255,0.28)'}
            />
          ))}

          {/* Hero block */}
          <rect
            className="web-fade"
            style={{ animationDelay: '0.5s' }}
            x="18"
            y="92"
            width="320"
            height="148"
            fill="rgba(255,255,255,0.06)"
          />
          <path
            className="web-draw"
            pathLength={100}
            d="M38 128 H278"
            fill="none"
            stroke="#F9F9F9"
            strokeWidth="10"
          />
          <path
            className="web-draw"
            pathLength={100}
            style={{ animationDelay: '0.25s' }}
            d="M38 154 H214"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="6"
          />
          <rect
            className="web-fade"
            style={{ animationDelay: '0.9s' }}
            x="38"
            y="178"
            width="112"
            height="28"
            fill="#02C39A"
          />

          {/* Sidebar cards */}
          <rect
            className="web-fade"
            style={{ animationDelay: '0.7s' }}
            x="354"
            y="92"
            width="184"
            height="68"
            fill="rgba(255,255,255,0.06)"
          />
          <rect
            className="web-fade"
            style={{ animationDelay: '0.85s' }}
            x="354"
            y="172"
            width="184"
            height="68"
            fill="rgba(255,255,255,0.06)"
          />
          <path
            className="web-draw"
            pathLength={100}
            style={{ animationDelay: '0.4s' }}
            d="M372 118 H510 M372 198 H486"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="6"
          />

          {/* Cursor */}
          <g transform="translate(148 168)">
            <g className="web-cursor">
              <path d="M0 0 L0 22 L6 16 L12 28 L16 26 L10 14 L18 14 Z" fill="#F9F9F9" />
              <rect className="web-blink" x="18" y="0" width="8" height="16" fill="#02C39A" />
            </g>
          </g>
        </g>

        {/* Uptime */}
        <g transform="translate(82 530)">
          <rect width="260" height="150" fill="url(#webPanel)" />
          <rect
            x="1"
            y="1"
            width="258"
            height="148"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />
          <text
            x="22"
            y="36"
            fill="rgba(255,255,255,0.55)"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="3"
          >
            UPTIME
          </text>
          <text
            x="22"
            y="92"
            fill="#F9F9F9"
            fontFamily="Arial Narrow, Impact, sans-serif"
            fontSize="48"
            fontWeight="800"
          >
            99.9
          </text>
          <text
            x="148"
            y="72"
            fill="#02C39A"
            fontFamily="Consolas, monospace"
            fontSize="14"
            letterSpacing="2"
          >
            %
          </text>
          <circle
            className="web-pulse"
            cx="228"
            cy="36"
            r="7"
            fill="#02C39A"
            filter="url(#webGlow)"
          />
          <text
            x="22"
            y="122"
            fill="rgba(255,255,255,0.45)"
            fontFamily="Consolas, monospace"
            fontSize="11"
            letterSpacing="2"
          >
            HOSTING + SSL + BACKUPS
          </text>
        </g>

        {/* Growth */}
        <g transform="translate(358 530)">
          <rect width="280" height="150" fill="url(#webPanel)" />
          <rect
            x="1"
            y="1"
            width="278"
            height="148"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />
          <text
            x="22"
            y="36"
            fill="rgba(255,255,255,0.55)"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="3"
          >
            GROWTH
          </text>
          {[44, 86, 128].map((y) => (
            <line
              key={y}
              x1="22"
              y1={y}
              x2="256"
              y2={y}
              stroke="rgba(255,255,255,0.07)"
            />
          ))}
          <path
            className="web-draw"
            pathLength={100}
            d="M28 128 C68 122 86 108 118 96 C152 82 176 70 210 48 C232 34 246 28 258 22"
            fill="none"
            stroke="url(#webAccent)"
            strokeWidth="4"
          />
          <circle r="5" fill="#B8FFF0" filter="url(#webGlow)">
            <animateMotion
              dur="3.2s"
              begin="1.2s"
              repeatCount="indefinite"
              path="M28 128 C68 122 86 108 118 96 C152 82 176 70 210 48 C232 34 246 28 258 22"
            />
          </circle>
          <text
            x="176"
            y="36"
            fill="#02C39A"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="2"
          >
            SEO + LEADS
          </text>
        </g>

        {/* Pipeline */}
        <g transform="translate(82 700)">
          <rect width="556" height="86" fill="url(#webPanel)" />
          <rect
            x="1"
            y="1"
            width="554"
            height="84"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />
          {[
            { label: 'CREAR', x: 48 },
            { label: 'MANTENER', x: 178 },
            { label: 'CRECER', x: 328 },
            { label: 'MONETIZAR', x: 458 },
          ].map((step, i) => (
            <g key={step.label}>
              {i < 3 && (
                <path
                  className="web-draw"
                  pathLength={100}
                  style={{ animationDelay: `${0.5 + i * 0.2}s` }}
                  d={`M${step.x + 86} 44 H${step.x + 118}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="2"
                />
              )}
              <rect
                className="web-pulse"
                style={{ animationDelay: `${i * 0.35}s` }}
                x={step.x}
                y="28"
                width="14"
                height="14"
                fill={i === 3 ? '#02C39A' : 'rgba(255,255,255,0.75)'}
              />
              <text
                x={step.x + 24}
                y="40"
                fill="rgba(255,255,255,0.72)"
                fontFamily="Consolas, monospace"
                fontSize="11"
                letterSpacing="2"
              >
                {step.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
        aria-hidden="true"
      />
    </div>
  );
}
