import type { Metadata } from 'next';
import { LegalLayout } from '@/components/blocks/LegalLayout';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Cluster Media.',
  alternates: { canonical: '/privacidad' },
  robots: { index: false, follow: true },
};

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad" updated="Junio 2026">
      <p>
        En {site.name} valoramos tu privacidad. Esta política describe cómo
        recopilamos, usamos y protegemos la información que nos proporcionas al
        usar nuestro website o contratar nuestros servicios.
      </p>

      <div>
        <h2>Información que recopilamos</h2>
        <p>
          Podemos recopilar datos que nos entregas voluntariamente a través de
          formularios o canales de contacto, como nombre, empresa, país, ciudad,
          email y teléfono, así como datos de navegación mediante herramientas de
          analítica.
        </p>
      </div>

      <div>
        <h2>Cómo usamos tu información</h2>
        <ul>
          <li>Para responder a tus solicitudes y consultas.</li>
          <li>Para enviarte información sobre nuestros servicios.</li>
          <li>Para mejorar la experiencia y el rendimiento del sitio.</li>
          <li>Para cumplir obligaciones legales aplicables.</li>
        </ul>
      </div>

      <div>
        <h2>Cookies y analítica</h2>
        <p>
          Utilizamos cookies y herramientas como Google Analytics y píxeles de
          Meta y Google para entender el uso del sitio y optimizar nuestras
          campañas. Puedes administrar las cookies desde la configuración de tu
          navegador.
        </p>
      </div>

      <div>
        <h2>Tus derechos</h2>
        <p>
          Puedes solicitar acceso, rectificación o eliminación de tus datos
          personales escribiéndonos a{' '}
          <a href={`mailto:${site.email}`} className="text-accent underline">
            {site.email}
          </a>
          .
        </p>
      </div>

      <div>
        <h2>Contacto</h2>
        <p>
          Si tienes dudas sobre esta política, contáctanos en {site.email}.
        </p>
      </div>
    </LegalLayout>
  );
}
