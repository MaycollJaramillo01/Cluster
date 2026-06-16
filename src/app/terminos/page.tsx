import type { Metadata } from 'next';
import { LegalLayout } from '@/components/blocks/LegalLayout';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de los servicios de Cluster Media.',
  alternates: { canonical: '/terminos' },
  robots: { index: false, follow: true },
};

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y Condiciones" updated="Junio 2026">
      <p>
        Estos términos regulan el uso del website de {site.name} y la
        contratación de nuestros servicios. Al navegar o contratar, aceptas
        estas condiciones.
      </p>

      <div>
        <h2>Servicios</h2>
        <p>
          {site.name} ofrece servicios de marketing digital, incluyendo
          branding, redes sociales, Google Ads, websites, SEO y automatización
          con IA. El alcance específico de cada servicio se define en la
          propuesta o contrato correspondiente.
        </p>
      </div>

      <div>
        <h2>Precios e inversión publicitaria</h2>
        <ul>
          <li>Los precios publicados pueden actualizarse sin previo aviso.</li>
          <li>
            La inversión publicitaria (pauta en Google o Meta) no está incluida
            en los precios de gestión, salvo que se indique expresamente.
          </li>
          <li>
            El Paquete Digital Inicial es un pago único; las condiciones de
            hosting y dominio se definen por separado.
          </li>
        </ul>
      </div>

      <div>
        <h2>Responsabilidades del cliente</h2>
        <p>
          El cliente debe proporcionar la información, materiales y accesos
          necesarios para la correcta ejecución de los servicios. Los tiempos de
          entrega dependen de la entrega oportuna de dichos materiales.
        </p>
      </div>

      <div>
        <h2>Resultados</h2>
        <p>
          Trabajamos con estrategias orientadas a resultados, pero el desempeño
          de campañas depende de múltiples factores de mercado. No garantizamos
          resultados específicos de ventas o leads.
        </p>
      </div>

      <div>
        <h2>Contacto</h2>
        <p>
          Para cualquier consulta sobre estos términos, escríbenos a{' '}
          <a href={`mailto:${site.email}`} className="text-accent underline">
            {site.email}
          </a>
          .
        </p>
      </div>
    </LegalLayout>
  );
}
