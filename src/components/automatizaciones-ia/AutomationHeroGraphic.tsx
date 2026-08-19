const AUTO_HERO_STYLES = `
  .auto-svg [class^="auto-"] { transform-box: fill-box; }
  .auto-fade { opacity: 0; animation: auto-fade 0.45s ease-out forwards; }
  .auto-chat { animation: auto-chat 5.2s ease-in-out infinite; }
  .auto-pulse { transform-origin: center; animation: auto-pulse 2.2s ease-in-out infinite; }
  .auto-path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: auto-path 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  @keyframes auto-fade { to { opacity: 1; } }
  @keyframes auto-chat {
    0%, 100% { transform: translateY(0); opacity: 1; }
    45% { transform: translateY(-7px); opacity: 0.9; }
    70% { transform: translateY(0); opacity: 1; }
  }
  @keyframes auto-pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.2)} }
  @keyframes auto-path { to { stroke-dashoffset: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .auto-svg [class^="auto-"] {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      stroke-dashoffset: 0 !important;
    }
  }
`;

export function AutomationHeroGraphic() {
  return (
    <div className="relative h-full w-full bg-ink-950">
      <svg viewBox="0 0 720 900" className="auto-svg h-full w-full" role="img" aria-label="Animacion de chatbot respondiendo mensajes y enviando leads al CRM">
        <defs>
          <style dangerouslySetInnerHTML={{ __html: AUTO_HERO_STYLES }} />
          <linearGradient id="autoA" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#02C39A" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="autoP" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1D1D1D" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </linearGradient>
        </defs>
        <rect width="720" height="900" fill="#080808" />
        <rect x="62" y="112" width="596" height="688" fill="none" stroke="rgba(255,255,255,0.14)" />

        <g transform="translate(92 140)">
          <rect width="536" height="74" fill="#F9F9F9" />
          <text x="24" y="32" fill="#111111" fontFamily="Consolas, monospace" fontSize="12" fontWeight="700" letterSpacing="3">AI CHAT FLOW</text>
          <text x="24" y="54" fill="rgba(17,17,17,0.6)" fontFamily="Consolas, monospace" fontSize="10" letterSpacing="2">WHATSAPP / BOT / CRM / FOLLOW UP</text>
        </g>

        <g transform="translate(92 236)">
          <rect width="248" height="336" fill="url(#autoP)" />
          <rect x="1" y="1" width="246" height="334" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="18" y="32" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">CHAT</text>
          {[
            { x: 18, y: 56, w: 148, c: 'rgba(255,255,255,0.1)' },
            { x: 82, y: 106, w: 148, c: 'rgba(2,195,154,0.22)' },
            { x: 18, y: 156, w: 132, c: 'rgba(255,255,255,0.1)' },
            { x: 82, y: 206, w: 148, c: 'rgba(2,195,154,0.22)' },
            { x: 18, y: 256, w: 164, c: 'rgba(255,255,255,0.1)' },
          ].map((b, i) => (
            <rect key={i} className="auto-chat auto-fade" style={{ animationDelay: `${0.15 + i * 0.2}s` }} x={b.x} y={b.y} rx="8" width={b.w} height="32" fill={b.c} />
          ))}
          <circle className="auto-pulse" cx="216" cy="308" r="8" fill="#02C39A" />
        </g>

        <g transform="translate(364 236)">
          <rect width="264" height="162" fill="url(#autoP)" />
          <rect x="1" y="1" width="262" height="160" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="32" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">CHATBOT</text>
          <circle cx="64" cy="86" r="24" fill="rgba(2,195,154,0.2)" />
          <rect x="50" y="74" width="7" height="7" fill="#02C39A" />
          <rect x="71" y="74" width="7" height="7" fill="#02C39A" />
          <rect x="54" y="92" width="22" height="4" fill="#02C39A" />
          <text x="102" y="82" fill="rgba(255,255,255,0.82)" fontFamily="Consolas, monospace" fontSize="10">Respondiendo en 15s</text>
          <text x="102" y="102" fill="rgba(255,255,255,0.58)" fontFamily="Consolas, monospace" fontSize="10">Calificando lead...</text>
        </g>

        <g transform="translate(364 410)">
          <rect width="264" height="162" fill="url(#autoP)" />
          <rect x="1" y="1" width="262" height="160" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="32" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">CRM</text>
          {[0, 1, 2].map((i) => (
            <g key={i} className="auto-fade" style={{ animationDelay: `${0.45 + i * 0.16}s` }}>
              <rect x="20" y={46 + i * 34} width="224" height="24" fill="rgba(255,255,255,0.06)" />
              <rect x="28" y={54 + i * 34} width="84" height="8" fill="rgba(255,255,255,0.4)" />
              <rect x="160" y={52 + i * 34} width="76" height="12" fill="rgba(2,195,154,0.28)" />
            </g>
          ))}
        </g>

        <path className="auto-path" d="M340 320 C364 320 344 312 364 312" fill="none" stroke="url(#autoA)" strokeWidth="3" />
        <path className="auto-path" style={{ animationDelay: '0.35s' }} d="M496 398 C496 422 496 386 496 410" fill="none" stroke="url(#autoA)" strokeWidth="3" />
        <circle className="auto-pulse" cx="364" cy="312" r="6" fill="#02C39A" />
        <circle className="auto-pulse" cx="496" cy="410" r="6" fill="#60A5FA" />

        <g transform="translate(92 594)">
          <rect width="536" height="182" fill="url(#autoP)" />
          <rect x="1" y="1" width="534" height="180" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text x="20" y="32" fill="rgba(255,255,255,0.55)" fontFamily="Consolas, monospace" fontSize="10">AUTOMATIZACIONES</text>
          {[
            'Respuesta instantanea',
            'Calificacion de lead',
            'Asignacion a vendedor',
            'Seguimiento automatico',
          ].map((t, i) => (
            <g key={t} className="auto-fade" style={{ animationDelay: `${0.6 + i * 0.15}s` }}>
              <rect x="20" y={44 + i * 32} width="496" height="24" fill="rgba(255,255,255,0.06)" />
              <rect x="30" y={52 + i * 32} width="8" height="8" fill="#02C39A" />
              <text x="48" y={59 + i * 32} fill="rgba(255,255,255,0.75)" fontFamily="Consolas, monospace" fontSize="10">{t}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}
