const SOCIAL_HERO_STYLES = `
  .social-svg [class^="social-"] { transform-box: fill-box; }
  .social-pop {
    opacity: 0;
    transform: translateY(8px) scale(0.94);
    animation: social-pop 0.45s ease-out forwards;
  }
  .social-pulse {
    transform-origin: center;
    animation: social-pulse 2s ease-in-out infinite;
  }
  .social-float {
    animation: social-float 4.8s ease-in-out infinite;
  }
  .social-line {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: social-line 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes social-pop { to { opacity: 1; transform: none; } }
  @keyframes social-pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.18); opacity: 1; }
  }
  @keyframes social-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes social-line { to { stroke-dashoffset: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .social-svg [class^="social-"] {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      stroke-dashoffset: 0 !important;
    }
  }
`;

export function SocialHeroGraphic() {
  return (
    <div className="relative h-full w-full bg-ink-950">
      <svg viewBox="0 0 720 900" className="social-svg h-full w-full" role="img" aria-label="Animacion de interacciones en redes sociales">
        <defs>
          <style dangerouslySetInnerHTML={{ __html: SOCIAL_HERO_STYLES }} />
          <linearGradient id="socialA" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#02C39A" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="socialP" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1C1C1C" />
            <stop offset="100%" stopColor="#0B0B0B" />
          </linearGradient>
        </defs>

        <rect width="720" height="900" fill="#0A0A0A" />
        <rect x="72" y="124" width="576" height="652" fill="none" stroke="rgba(255,255,255,0.14)" />

        <g transform="translate(96 152)">
          <rect width="528" height="70" fill="#F9F9F9" />
          <text x="26" y="30" fill="#111111" fontFamily="Consolas, monospace" fontSize="12" fontWeight="700" letterSpacing="3">
            SOCIAL CONTENT FLOW
          </text>
          <text x="26" y="52" fill="rgba(17,17,17,0.62)" fontFamily="Consolas, monospace" fontSize="10" letterSpacing="2">
            POSTS / REELS / ADS / COMMUNITY
          </text>
        </g>

        <g transform="translate(96 246)">
          <rect width="340" height="220" fill="url(#socialP)" />
          <rect x="1" y="1" width="338" height="218" fill="none" stroke="rgba(255,255,255,0.14)" />
          <rect className="social-pop" style={{ animationDelay: '0.1s' }} x="18" y="20" width="304" height="124" fill="rgba(255,255,255,0.06)" />
          <rect className="social-pop" style={{ animationDelay: '0.28s' }} x="18" y="158" width="160" height="10" fill="rgba(255,255,255,0.5)" />
          <rect className="social-pop" style={{ animationDelay: '0.38s' }} x="18" y="176" width="224" height="8" fill="rgba(255,255,255,0.28)" />
          <circle className="social-pulse" cx="300" cy="178" r="12" fill="#EC4899" />
          <text x="300" y="182" textAnchor="middle" fill="#fff" fontSize="10">♥</text>
        </g>

        <g transform="translate(456 246)">
          <rect width="168" height="220" fill="url(#socialP)" />
          <rect x="1" y="1" width="166" height="218" fill="none" stroke="rgba(255,255,255,0.14)" />
          {[
            { c: '#38BDF8', t: '+24 comentarios' },
            { c: '#02C39A', t: '+130 likes' },
            { c: '#F59E0B', t: '+11 mensajes' },
          ].map((n, i) => (
            <g key={n.t} className="social-pop" style={{ animationDelay: `${0.35 + i * 0.16}s` }}>
              <rect x="14" y={22 + i * 64} width="140" height="44" fill="rgba(255,255,255,0.06)" />
              <circle cx="32" cy={44 + i * 64} r="8" fill={n.c} />
              <text x="48" y={48 + i * 64} fill="rgba(255,255,255,0.8)" fontFamily="Consolas, monospace" fontSize="10">{n.t}</text>
            </g>
          ))}
        </g>

        <g transform="translate(96 492)">
          <rect width="528" height="132" fill="url(#socialP)" />
          <rect x="1" y="1" width="526" height="130" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="32" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10" letterSpacing="2">INTERACCIONES</text>
          <path className="social-line" d="M22 102 C72 90 102 96 146 80 C186 66 214 72 248 56 C284 40 320 46 362 34 C404 22 454 18 506 14" fill="none" stroke="url(#socialA)" strokeWidth="4" />
          <circle className="social-float" cx="506" cy="14" r="7" fill="#02C39A" />
        </g>

        <g transform="translate(96 646)">
          <rect width="528" height="130" fill="url(#socialP)" />
          <rect x="1" y="1" width="526" height="128" fill="none" stroke="rgba(255,255,255,0.14)" />
          {['Alcance', 'Interaccion', 'Mensajes', 'Ventas'].map((s, i) => (
            <g key={s} className="social-pop" style={{ animationDelay: `${0.7 + i * 0.12}s` }}>
              <rect x={20 + i * 126} y="44" width="112" height="46" fill="rgba(255,255,255,0.06)" />
              <text x={30 + i * 126} y="62" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">{s}</text>
              <text x={30 + i * 126} y="82" fill="#02C39A" fontFamily="Arial Narrow, Impact, sans-serif" fontSize="24">{['+42%', '+31%', '+58', '+19%'][i]}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}
