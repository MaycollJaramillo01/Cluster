const ADS_HERO_STYLES = `
  .ads-svg [class^="ads-"] { transform-box: fill-box; }
  .ads-grow { transform-origin: bottom; transform: scaleY(0); animation: ads-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .ads-draw { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ads-draw 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .ads-fade { opacity: 0; animation: ads-fade 0.5s ease-out forwards; }
  .ads-pulse { animation: ads-pulse 2.2s ease-in-out infinite; transform-origin: center; }
  @keyframes ads-grow { to { transform: scaleY(1); } }
  @keyframes ads-draw { to { stroke-dashoffset: 0; } }
  @keyframes ads-fade { to { opacity: 1; } }
  @keyframes ads-pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.22)} }
  @media (prefers-reduced-motion: reduce) {
    .ads-svg [class^="ads-"] {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      stroke-dashoffset: 0 !important;
    }
  }
`;

export function GoogleAdsHeroGraphic() {
  return (
    <div className="relative h-full w-full bg-ink-950">
      <svg viewBox="0 0 720 900" className="ads-svg h-full w-full" role="img" aria-label="Animacion de graficas de rendimiento en Google Ads">
        <defs>
          <style dangerouslySetInnerHTML={{ __html: ADS_HERO_STYLES }} />
          <linearGradient id="adsA" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#02C39A" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          <linearGradient id="adsP" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1C1C1C" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </linearGradient>
        </defs>
        <rect width="720" height="900" fill="#080808" />
        <rect x="62" y="112" width="596" height="688" fill="none" stroke="rgba(255,255,255,0.14)" />

        <g transform="translate(92 140)">
          <rect width="536" height="74" fill="#F9F9F9" />
          <text x="24" y="32" fill="#111111" fontFamily="Consolas, monospace" fontSize="12" fontWeight="700" letterSpacing="3">GOOGLE ADS DASHBOARD</text>
          <text x="24" y="54" fill="rgba(17,17,17,0.6)" fontFamily="Consolas, monospace" fontSize="10" letterSpacing="2">CLICKS / CPC / CONVERSIONES</text>
        </g>

        <g transform="translate(92 238)">
          <rect width="368" height="262" fill="url(#adsP)" />
          <rect x="1" y="1" width="366" height="260" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="32" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">RENDIMIENTO</text>
          {[50, 100, 150, 200].map((y) => <line key={y} x1="20" y1={y} x2="346" y2={y} stroke="rgba(255,255,255,0.08)" />)}
          <path className="ads-draw" d="M24 216 C66 196 94 201 122 176 C156 146 180 153 214 124 C242 100 276 102 308 74 C320 62 332 54 344 42" fill="none" stroke="url(#adsA)" strokeWidth="4" />
          <circle className="ads-pulse" cx="344" cy="42" r="7" fill="#02C39A" />
        </g>

        <g transform="translate(474 238)">
          <rect width="154" height="262" fill="url(#adsP)" />
          <rect x="1" y="1" width="152" height="260" fill="none" stroke="rgba(255,255,255,0.14)" />
          {[
            ['CTR', '+28%'],
            ['CPC', '-17%'],
            ['Leads', '+41%'],
          ].map((item, i) => (
            <g key={item[0]} className="ads-fade" style={{ animationDelay: `${0.25 + i * 0.15}s` }}>
              <rect x="14" y={22 + i * 76} width="126" height="56" fill="rgba(255,255,255,0.06)" />
              <text x="24" y={44 + i * 76} fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">{item[0]}</text>
              <text x="24" y={66 + i * 76} fill="#02C39A" fontFamily="Arial Narrow, Impact, sans-serif" fontSize="26">{item[1]}</text>
            </g>
          ))}
        </g>

        <g transform="translate(92 526)">
          <rect width="536" height="252" fill="url(#adsP)" />
          <rect x="1" y="1" width="534" height="250" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="32" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">CAMPANAS</text>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect className="ads-fade" style={{ animationDelay: `${0.2 + i * 0.12}s` }} x="20" y={50 + i * 38} width="494" height="28" fill="rgba(255,255,255,0.05)" />
              <rect className="ads-grow" style={{ animationDelay: `${0.5 + i * 0.1}s` }} x="20" y={50 + i * 38} width={[300, 410, 252, 468, 356][i]} height="28" fill={i % 2 === 0 ? 'rgba(2,195,154,0.35)' : 'rgba(250,204,21,0.32)'} />
            </g>
          ))}
          <text x="20" y="238" fill="rgba(255,255,255,0.5)" fontFamily="Consolas, monospace" fontSize="10">OPTIMIZACION MENSUAL ACTIVA</text>
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}
