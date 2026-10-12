export function Setup({ detail }: { detail?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-white">
      <div className="w-full max-w-xl border border-white/15 bg-[#161616] p-8">
        <p className="font-brand text-xs font-extrabold uppercase tracking-[0.22em] text-brand">Cluster</p>
        <h1 className="mt-4 font-display text-6xl tracking-wide">CRM</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          El panel pide la base al conector <span className="font-mono text-brand">neon/clustercrm</span>. En Vercel el acceso llega solo. En tu máquina hace falta el token del proyecto.
        </p>
        <ol className="mt-6 space-y-3 text-sm leading-relaxed text-white/80">
          <li>1. En la carpeta del proyecto corre <span className="font-mono text-brand">vercel link</span>.</li>
          <li>2. Luego <span className="font-mono text-brand">vercel env pull</span> para bajar <span className="font-mono">VERCEL_OIDC_TOKEN</span>.</li>
          <li>3. Reinicia el servidor y vuelve a abrir /dashboard.</li>
        </ol>
        {detail ? <p className="mt-6 border border-white/15 px-3 py-2 font-mono text-xs text-white/60">{detail}</p> : null}
      </div>
    </main>
  );
}

export function safeDbError(error: unknown) {
  return String(error instanceof Error ? error.message : error)
    .replace(/postgres(?:ql)?:\/\/\S+/gi, 'postgresql://…')
    .slice(0, 280);
}
