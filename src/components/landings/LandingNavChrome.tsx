import Link from 'next/link';

type CountryLink = {
  code: string;
  name: string;
  path: string;
};

type Props = {
  verticalLabel: string;
  verticalPath: string;
  countryName: string;
  countries: CountryLink[];
  activeCode: string;
};

export function LandingNavChrome({
  verticalLabel,
  verticalPath,
  countryName,
  countries,
  activeCode,
}: Props) {
  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="theme-dark border-b border-line bg-ink-950"
      >
        <div className="container-x flex flex-wrap items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          <Link href="/" className="hover:text-accent">
            Inicio
          </Link>
          <span>/</span>
          <Link href={verticalPath} className="hover:text-accent">
            {verticalLabel}
          </Link>
          <span>/</span>
          <span className="text-fg">{countryName}</span>
        </div>
      </nav>

      <div className="theme-dark border-b border-line bg-ink-900">
        <div className="container-x flex flex-wrap items-center gap-2 py-3">
          <span className="mono-label text-faint">Mercado</span>
          {countries.map((c) => {
            const active = c.code === activeCode;
            return (
              <Link
                key={c.code}
                href={c.path}
                className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? 'bg-accent text-accent-fg'
                    : 'border border-line text-muted hover:border-accent hover:text-fg'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
