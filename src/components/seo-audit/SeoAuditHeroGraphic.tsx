const HERO_STYLES = `
  .seo-svg [class^="seo-"] { transform-box: fill-box; }

  .seo-draw {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: seo-draw 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .seo-arc {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: seo-draw 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards,
      seo-arc-glow 3.2s ease-in-out 2.2s infinite;
  }

  .seo-bar {
    transform-origin: bottom;
    transform: scaleY(0);
    animation: seo-grow 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .seo-marker {
    transform-origin: center;
    opacity: 0;
    animation: seo-marker-in 0.5s ease-out forwards,
      seo-marker-pulse 2.6s ease-in-out infinite;
  }

  .seo-node {
    transform-origin: center;
    animation: seo-node-pulse 2.4s ease-in-out infinite;
  }

  .seo-rowline {
    transform-origin: left;
    transform: scaleX(0);
    animation: seo-rowline 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .seo-rowbox {
    transform-origin: center;
    animation: seo-blink 2.2s steps(1, end) infinite;
  }

  .seo-num {
    transform-origin: center;
    animation: seo-num 3.4s ease-in-out infinite;
  }

  .seo-orbit { animation: seo-orbit-fade 2.2s ease-out forwards; }
  .seo-orbit circle { opacity: 0; animation: seo-dot-on 0.4s ease-out 2s forwards; }

  .seo-probe { opacity: 0; animation: seo-dot-on 0.4s ease-out 1.4s forwards; }
  .seo-pulse-dot { opacity: 0; animation: seo-dot-on 0.4s ease-out 1.6s forwards; }

  .seo-vscan { animation: seo-vscan 3.6s ease-in-out infinite; }
  .seo-hscan { transform-origin: center; animation: seo-hscan 4.2s ease-in-out infinite; }
  .seo-sweep { animation: seo-sweep 6s ease-in-out infinite; }

  @keyframes seo-draw { to { stroke-dashoffset: 0; } }
  @keyframes seo-grow { to { transform: scaleY(1); } }
  @keyframes seo-rowline { to { transform: scaleX(1); } }
  @keyframes seo-marker-in { to { opacity: 1; transform: scale(1); } }
  @keyframes seo-marker-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.55); }
  }
  @keyframes seo-node-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  @keyframes seo-blink {
    0%, 60%, 100% { opacity: 1; }
    70%, 90% { opacity: 0.25; }
  }
  @keyframes seo-num {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes seo-arc-glow {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 1; }
  }
  @keyframes seo-dot-on { to { opacity: 1; } }
  @keyframes seo-orbit-fade { to { opacity: 1; } }
  @keyframes seo-vscan {
    0% { transform: translateX(0); opacity: 0; }
    12% { opacity: 0.9; }
    88% { opacity: 0.9; }
    100% { transform: translateX(216px); opacity: 0; }
  }
  @keyframes seo-hscan {
    0%, 100% { transform: translateY(0); opacity: 0; }
    20% { opacity: 0.8; }
    80% { opacity: 0.8; }
    50% { transform: translateY(78px); opacity: 0.8; }
  }
  @keyframes seo-sweep {
    0% { transform: translateY(-40px); opacity: 0; }
    15% { opacity: 0.5; }
    85% { opacity: 0.5; }
    100% { transform: translateY(720px); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .seo-svg [class^="seo-"] {
      animation: none !important;
      stroke-dashoffset: 0 !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

const CONTENT_BARS = [20, 38, 52, 72, 61, 88, 94, 70, 82, 100, 74, 108, 96];
const CONTENT_X = [42, 78, 114, 150, 186, 222, 258, 294, 330, 366, 402, 438, 474];

export function SeoAuditHeroGraphic() {
  return (
    <div className="relative h-full w-full bg-ink-950 text-white">
      <svg
        viewBox="0 0 720 900"
        role="img"
        aria-label="Dashboard vectorial animado de auditoria SEO con graficos, score y recomendaciones"
        className="seo-svg h-full w-full"
      >
        <defs>
          <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
          <linearGradient id="seoAccent" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#02C39A" />
            <stop offset="100%" stopColor="#B8FFF0" />
          </linearGradient>
          <linearGradient id="seoPanel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#202020" />
            <stop offset="100%" stopColor="#0B0B0B" />
          </linearGradient>
          <linearGradient id="seoScan" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#02C39A" stopOpacity="0" />
            <stop offset="50%" stopColor="#02C39A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#02C39A" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="seoGrid"
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
          <filter id="seoSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="720" height="900" fill="#080808" />
        <rect width="720" height="900" fill="url(#seoGrid)" opacity="0.55" />
        <path
          d="M52 104 H668 V802 H52 Z"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
        />

        {/* Barrido global del panel */}
        <rect
          className="seo-sweep"
          x="52"
          y="104"
          width="616"
          height="40"
          fill="url(#seoScan)"
          opacity="0.5"
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
            SEO AUDIT VECTOR SYSTEM
          </text>
          <text
            x="28"
            y="56"
            fill="rgba(17,17,17,0.62)"
            fontFamily="Consolas, monospace"
            fontSize="11"
            letterSpacing="2"
          >
            CRAWL / CONTENT / LOCAL / CONVERSION
          </text>
        </g>

        {/* SCORE */}
        <g transform="translate(82 188)">
          <rect width="246" height="246" fill="url(#seoPanel)" />
          <rect
            x="1"
            y="1"
            width="244"
            height="244"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />
          <text
            x="24"
            y="38"
            fill="rgba(255,255,255,0.55)"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="3"
          >
            SCORE
          </text>
          <circle
            cx="123"
            cy="134"
            r="72"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="18"
          />
          <path
            className="seo-arc"
            pathLength={100}
            d="M123 62 A72 72 0 1 1 61 171"
            fill="none"
            stroke="url(#seoAccent)"
            strokeLinecap="square"
            strokeWidth="18"
            filter="url(#seoSoftGlow)"
          />
          {/* Punto que recorre el arco */}
          <g className="seo-orbit">
            <circle r="6" fill="#B8FFF0" filter="url(#seoSoftGlow)">
              <animateMotion
                dur="3.2s"
                begin="2.2s"
                repeatCount="indefinite"
                rotate="auto"
                path="M123 62 A72 72 0 1 1 61 171"
              />
            </circle>
          </g>
          <g className="seo-num">
            <text
              x="123"
              y="130"
              textAnchor="middle"
              fill="#F9F9F9"
              fontFamily="Arial Narrow, Impact, sans-serif"
              fontSize="64"
              fontWeight="800"
            >
              86
            </text>
          </g>
          <text
            x="123"
            y="158"
            textAnchor="middle"
            fill="#02C39A"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="3"
          >
            READY
          </text>
        </g>

        {/* ORGANIC SIGNALS */}
        <g transform="translate(358 188)">
          <rect width="280" height="246" fill="url(#seoPanel)" />
          <rect
            x="1"
            y="1"
            width="278"
            height="244"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />
          <text
            x="24"
            y="38"
            fill="rgba(255,255,255,0.55)"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="3"
          >
            ORGANIC SIGNALS
          </text>
          {[40, 78, 116, 154, 192].map((x) => (
            <line
              key={x}
              x1={x}
              y1="66"
              x2={x}
              y2="210"
              stroke="rgba(255,255,255,0.07)"
            />
          ))}
          {[86, 126, 166, 206].map((y) => (
            <line
              key={y}
              x1="32"
              y1={y}
              x2="248"
              y2={y}
              stroke="rgba(255,255,255,0.07)"
            />
          ))}
          {/* Linea secundaria */}
          <path
            className="seo-draw"
            pathLength={100}
            style={{ animationDelay: '0.3s' }}
            d="M34 199 C64 192 89 201 111 181 C140 154 168 166 190 138 C211 110 228 112 248 92"
            fill="none"
            stroke="rgba(255,255,255,0.38)"
            strokeLinecap="square"
            strokeWidth="2"
          />
          {/* Linea principal */}
          <path
            id="seoSignalLine"
            className="seo-draw"
            pathLength={100}
            d="M34 184 C66 158 79 172 102 145 C130 112 148 126 171 98 C199 64 219 76 248 44"
            fill="none"
            stroke="url(#seoAccent)"
            strokeLinecap="square"
            strokeWidth="4"
          />
          {/* Probe que viaja sobre la linea principal */}
          <circle className="seo-probe" r="5" fill="#B8FFF0" filter="url(#seoSoftGlow)">
            <animateMotion
              dur="3.4s"
              begin="1.4s"
              repeatCount="indefinite"
              path="M34 184 C66 158 79 172 102 145 C130 112 148 126 171 98 C199 64 219 76 248 44"
            />
          </circle>
          {[34, 102, 171, 248].map((x, index) => (
            <rect
              key={x}
              className="seo-marker"
              style={{ animationDelay: `${0.6 + index * 0.18}s` }}
              x={x - 5}
              y={[179, 140, 93, 39][index]}
              width="10"
              height="10"
              fill="#02C39A"
            />
          ))}
          {/* Linea de escaneo vertical */}
          <line
            className="seo-vscan"
            x1="32"
            y1="66"
            x2="32"
            y2="210"
            stroke="#02C39A"
            strokeWidth="2"
            opacity="0.7"
          />
        </g>

        {/* CONTENT DEPTH */}
        <g transform="translate(82 464)">
          <rect width="556" height="150" fill="url(#seoPanel)" />
          <rect
            x="1"
            y="1"
            width="554"
            height="148"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
          />
          <text
            x="24"
            y="38"
            fill="rgba(255,255,255,0.55)"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="3"
          >
            CONTENT DEPTH
          </text>
          {CONTENT_X.map((x, index) => (
            <rect
              key={x}
              className="seo-bar"
              style={{ animationDelay: `${0.2 + index * 0.07}s` }}
              x={x}
              y={112 - CONTENT_BARS[index]}
              width="20"
              height={CONTENT_BARS[index]}
              fill={index > 7 ? '#02C39A' : 'rgba(255,255,255,0.52)'}
            />
          ))}
          <path
            d="M42 102 H514"
            stroke="rgba(255,255,255,0.24)"
            strokeDasharray="8 10"
          />
          <text
            x="420"
            y="38"
            fill="#02C39A"
            fontFamily="Consolas, monospace"
            fontSize="12"
            letterSpacing="3"
          >
            +42% LIFT
          </text>
        </g>

        {/* CRAWL MAP */}
        <g transform="translate(82 644)">
          <rect width="260" height="142" fill="url(#seoPanel)" />
          <rect
            x="1"
            y="1"
            width="258"
            height="140"
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
            CRAWL MAP
          </text>
          <path
            className="seo-draw"
            pathLength={100}
            style={{ animationDelay: '0.4s' }}
            d="M56 94 H116 M116 94 L164 62 M116 94 L164 112 M164 62 H214 M164 112 H214"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="2"
          />
          {/* Pulso que recorre el crawl */}
          <circle className="seo-pulse-dot" r="4" fill="#02C39A" filter="url(#seoSoftGlow)">
            <animateMotion
              dur="2.6s"
              begin="1.6s"
              repeatCount="indefinite"
              keyPoints="0;1"
              keyTimes="0;1"
              path="M56 94 H116 L164 62 H214"
            />
          </circle>
          {[
            [56, 94],
            [116, 94],
            [164, 62],
            [164, 112],
            [214, 62],
            [214, 112],
          ].map(([x, y], index) => (
            <rect
              key={`${x}-${y}`}
              className="seo-node"
              style={{ animationDelay: `${index * 0.25}s` }}
              x={x - 11}
              y={y - 11}
              width="22"
              height="22"
              fill={index < 2 ? '#02C39A' : 'rgba(255,255,255,0.78)'}
            />
          ))}
        </g>

        {/* PRIORITIES */}
        <g transform="translate(374 644)">
          <rect width="264" height="142" fill="url(#seoPanel)" />
          <rect
            x="1"
            y="1"
            width="262"
            height="140"
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
            PRIORITIES
          </text>
          {[
            { label: 'TITLE TAG', y: 72, color: '#02C39A' },
            { label: 'LOCAL SEO', y: 98, color: '#F9F9F9' },
            { label: 'CTA FLOW', y: 124, color: '#F9F9F9' },
          ].map((item, index) => (
            <g key={item.label}>
              <rect
                className="seo-rowbox"
                style={{ animationDelay: `${0.6 + index * 0.2}s` }}
                x="24"
                y={item.y - 12}
                width="14"
                height="14"
                fill={item.color}
              />
              <line
                className="seo-rowline"
                style={{ animationDelay: `${0.4 + index * 0.2}s` }}
                x1="52"
                y1={item.y - 5}
                x2="224"
                y2={item.y - 5}
                stroke="rgba(255,255,255,0.18)"
              />
              <text
                x="52"
                y={item.y - 10}
                fill="rgba(255,255,255,0.7)"
                fontFamily="Consolas, monospace"
                fontSize="10"
                letterSpacing="2"
              >
                {item.label}
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
