import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { site, whatsappLink } from '@/lib/site';

const columns = [
  {
    title: 'Servicios',
    links: [
      { label: 'Branding', href: '/branding' },
      { label: 'Planes mensuales', href: '/#planes' },
      { label: 'Redes Sociales', href: '/redes-sociales' },
      { label: 'Google Ads', href: '/google-ads' },
      { label: 'IA / Automatizaciones', href: '/automatizaciones-ia' },
      { label: 'Websites / SEO', href: '/websites-seo' },
      { label: 'SEO Audit', href: '/seo-audit' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre Cluster', href: '/sobre-cluster' },
      { label: 'Casos de Éxito', href: '/casos-de-exito' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '/contacto' },
    ],
  },
];

const socials: { name: IconName; href: string; label: string }[] = [
  { name: 'instagram', href: site.social.instagram, label: 'Instagram' },
  { name: 'facebook', href: site.social.facebook, label: 'Facebook' },
  { name: 'linkedin', href: site.social.linkedin, label: 'LinkedIn' },
  { name: 'youtube', href: site.social.youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-950 text-white">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden="true"
      />
      <div className="container-x relative">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
          {/* Marca + descripción */}
          <div className="lg:col-span-4">
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
              Comunicación digital cercana, real y distinta para marcas que
              quieren conectar con su audiencia y crecer.
            </p>
            <div className="mt-6 flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center border-0 bg-surface text-muted transition-colors hover:bg-accent hover:text-accent-fg"
                >
                  <Icon name={s.name} size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Columnas de enlaces */}
          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-white/65 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contacto */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={site.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[15px] text-white/65 transition-colors hover:text-accent"
                >
                  <Icon name="calendar" size={17} className="text-accent" />
                  Agendar llamada
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[15px] text-white/65 transition-colors hover:text-accent"
                >
                  <Icon name="whatsapp" size={17} className="text-accent" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 text-[15px] text-white/65 transition-colors hover:text-accent"
                >
                  <Icon name="mail" size={17} className="text-accent" />
                  {site.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-[15px] text-white/65">
                <Icon name="pin" size={17} className="text-accent" />
                {site.location}
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-line py-7 sm:flex-row">
          <p className="text-sm text-white/45">
            © {new Date().getFullYear()} {site.name}. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacidad"
              className="text-sm text-white/45 transition-colors hover:text-white/80"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-white/45 transition-colors hover:text-white/80"
            >
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
