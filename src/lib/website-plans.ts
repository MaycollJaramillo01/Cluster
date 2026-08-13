import type { IconName } from '@/components/ui/Icon';

export type WebsitePlanSlug =
  | 'website'
  | 'website-plus'
  | 'website-leads'
  | 'website-seo'
  | 'website-seo-leads';

export type WebsitePlan = {
  slug: WebsitePlanSlug;
  name: string;
  nameAccent?: string;
  kicker?: string;
  headline: string;
  tagline: string;
  price: number;
  features: string[];
  idealFor: string[];
  faqs: { q: string; a: string }[];
  note?: string;
  footer?: string;
  highlight?: boolean;
  badge?: string;
  stripeUrl: string;
  whatsapp: string;
};

export function websitePlanDisplayName(plan: WebsitePlan) {
  return plan.nameAccent ? `${plan.name} ${plan.nameAccent}` : plan.name;
}

export const websitePlans: WebsitePlan[] = [
  {
    slug: 'website',
    name: 'Website',
    headline: 'Presencia web profesional con financiación mensual.',
    tagline: 'Presencia web profesional con financiación mensual.',
    price: 99,
    features: [
      'Hasta 7 páginas',
      'Hosting + SSL',
      'Diseño responsive',
      'Formulario de contacto + WhatsApp',
      '1 ronda de cambios al mes',
    ],
    idealFor: [
      'Negocios que necesitan su primera web profesional',
      'Emprendedores que quieren presencia clara y confiable',
      'Marcas que aún no requieren dominio gestionado por nosotros',
    ],
    faqs: [
      {
        q: '¿El dominio está incluido en Website?',
        a: 'No. En este plan el dominio no está incluido. Si lo necesitas, Website Plus ya lo contempla junto con más mantenimiento.',
      },
      {
        q: '¿Cuántas páginas incluye?',
        a: 'Hasta 7 páginas. Ideal para presentar tu negocio, servicios y contacto de forma clara.',
      },
      {
        q: '¿Puedo subir después a otro plan?',
        a: 'Sí. Cuando quieras sumar dominio gestionado, SEO o leads, podemos subir tu plan sin empezar de cero.',
      },
    ],
    note: 'Dominio no incluido',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website de USD 99/mes.',
  },
  {
    slug: 'website-plus',
    name: 'Website',
    nameAccent: 'Plus',
    headline: 'Tu presencia web completa, administrada y siempre activa.',
    tagline: 'Tu presencia web completa, administrada y siempre activa.',
    price: 129,
    features: [
      'Hasta 7 páginas',
      'Diseño responsive',
      'Formulario de contacto + WhatsApp',
      '1 ronda de cambios al mes',
      'Dominio incluido',
      'Hosting + SSL',
      'Backups periódicos',
      'Monitoreo y salud web',
    ],
    idealFor: [
      'Negocios que quieren olvidarse del hosting y el dominio',
      'Marcas que necesitan backups y monitoreo continuo',
      'Equipos que buscan una web administrada sin preocupaciones',
    ],
    faqs: [
      {
        q: '¿Qué suma Website Plus frente a Website?',
        a: 'Agrega dominio incluido, backups periódicos y monitoreo de salud web, además de todo lo de Website.',
      },
      {
        q: '¿El dominio queda a mi nombre?',
        a: 'Sí. Te acompañamos en la gestión del dominio como parte de la financiación mensual.',
      },
      {
        q: '¿Hay monitoreo incluido?',
        a: 'Sí. Revisamos la salud del sitio para detectar caídas o problemas básicos de forma oportuna.',
      },
    ],
    footer: 'Tu presencia digital sin preocupaciones.',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website Plus de USD 129/mes.',
  },
  {
    slug: 'website-leads',
    name: 'Website',
    nameAccent: '+ Leads',
    headline: 'Tu sitio web y una estrategia enfocada en generar oportunidades.',
    tagline:
      'Tu sitio web y una estrategia enfocada en generar oportunidades de negocio.',
    price: 279,
    features: [
      'Hasta 7 páginas',
      'Diseño responsive',
      'Formulario de contacto + WhatsApp',
      '1 ronda de cambios al mes',
      'Dominio incluido',
      'Hosting + SSL',
      'Backups periódicos',
      'Monitoreo y salud web',
      'Campaña de Google Ads',
      'Enfoque en generación de leads',
      'Optimización y seguimiento mensual',
      'Ideal para captar clientes',
    ],
    idealFor: [
      'Negocios listos para captar clientes de forma activa',
      'Marcas que ya tienen oferta clara y quieren más ventas',
      'Equipos que necesitan seguimiento mensual de campañas',
    ],
    faqs: [
      {
        q: '¿La inversión publicitaria está incluida?',
        a: 'No. Incluimos la gestión y optimización de la campaña de Google Ads. El presupuesto que pagas a Google es aparte.',
      },
      {
        q: '¿Qué incluye la campaña?',
        a: 'Configuración, optimización y seguimiento mensual con enfoque en generar leads calificados hacia tu website.',
      },
      {
        q: '¿Incluye mantenimiento web?',
        a: 'Sí. Incluye dominio, hosting, SSL, backups, monitoreo y las mismas bases del plan Website Plus.',
      },
    ],
    note: 'Inversión publicitaria no incluida',
    footer: 'Tu presencia digital con enfoque comercial.',
    highlight: true,
    badge: 'Popular',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website + Leads de USD 279/mes.',
  },
  {
    slug: 'website-seo',
    name: 'Website',
    nameAccent: '+ SEO',
    headline: 'Tu sitio web con visibilidad en Google para crecer orgánicamente.',
    tagline: 'Tu sitio web con visibilidad en Google para crecer orgánicamente.',
    price: 350,
    features: [
      'Hasta 7 páginas',
      'Diseño responsive',
      'Formulario de contacto + WhatsApp',
      '1 ronda de cambios al mes',
      'Dominio incluido',
      'Hosting + SSL',
      'Backups periódicos',
      'Monitoreo y salud web',
      'SEO local y on-page',
      'Hasta 15 keywords prioritarias',
      'Optimización mensual + 1 artículo',
      'Perfil de Negocio de Google optimizado',
    ],
    idealFor: [
      'Negocios locales que quieren aparecer en búsquedas',
      'Marcas que priorizan tráfico orgánico sostenible',
      'Equipos que necesitan contenido SEO mensual',
    ],
    faqs: [
      {
        q: '¿Cuántas keywords trabajan?',
        a: 'Hasta 15 keywords prioritarias, alineadas a tu oferta y a búsquedas con intención comercial.',
      },
      {
        q: '¿Incluye contenido?',
        a: 'Sí. Cada mes optimizamos y entregamos 1 artículo SEO para reforzar tu posicionamiento.',
      },
      {
        q: '¿Trabajan el perfil de Google?',
        a: 'Sí. Optimizamos tu Perfil de Negocio de Google para mejorar visibilidad local.',
      },
    ],
    footer: 'Tu presencia digital con enfoque en posicionamiento.',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website + SEO de USD 350/mes.',
  },
  {
    slug: 'website-seo-leads',
    name: 'Website',
    nameAccent: '+ SEO + Leads',
    headline: 'Website, posicionamiento y leads en una sola estrategia.',
    tagline:
      'Tu sitio web, tu posicionamiento y tus leads en una sola estrategia.',
    price: 499,
    features: [
      'Hasta 7 páginas',
      'Diseño responsive',
      'Formulario de contacto + WhatsApp',
      '1 ronda de cambios al mes',
      'Dominio incluido',
      'Hosting + SSL',
      'Backups periódicos',
      'Monitoreo y salud web',
      'Campaña de Google Ads',
      'SEO mensual',
      'SEO local y on-page',
      'Hasta 15 keywords prioritarias',
      '1 artículo SEO al mes',
      'Perfil de Negocio de Google optimizado',
      'Optimización y seguimiento mensual',
      'Enfoque en generación de leads',
    ],
    idealFor: [
      'Marcas que quieren crecimiento integral (orgánico + pagado)',
      'Negocios listos para operar web, SEO y Ads juntos',
      'Equipos que buscan un solo partner para presencia y ventas',
    ],
    faqs: [
      {
        q: '¿Qué diferencia tiene frente a Website + Leads o + SEO?',
        a: 'Junta web, SEO y Google Ads para conseguir más visitas y más ventas, sin contratar cada servicio por separado.',
      },
      {
        q: '¿La pauta de Ads está incluida?',
        a: 'No. Gestionamos y optimizamos la campaña; la inversión publicitaria en Google se paga aparte.',
      },
      {
        q: '¿Es el plan más completo?',
        a: 'Sí. Es la opción más integral para desarrollo, mantenimiento, posicionamiento y generación de leads.',
      },
    ],
    note: 'Inversión publicitaria no incluida',
    footer: 'Tu presencia digital con enfoque en crecimiento integral.',
    badge: 'Más completo',
    stripeUrl: '',
    whatsapp:
      'Hola, quiero contratar el plan Website + SEO + Leads de USD 499/mes.',
  },
];

export const websitePlanSlugs: WebsitePlanSlug[] = websitePlans.map(
  (plan) => plan.slug
);

export function getWebsitePlanBySlug(slug: string): WebsitePlan | undefined {
  return websitePlans.find((plan) => plan.slug === slug);
}

export const websitePlansStarter = websitePlans.filter(
  (plan) => plan.slug === 'website' || plan.slug === 'website-plus'
);

export const websitePlansAdvance = websitePlans.filter(
  (plan) =>
    plan.slug === 'website-leads' ||
    plan.slug === 'website-seo' ||
    plan.slug === 'website-seo-leads'
);

export const websitePlanBenefits: {
  icon: IconName;
  title: string;
  text: string;
}[] = [
  {
    icon: 'globe',
    title: 'Desarrollo web',
    text: 'Sitios claros y profesionales, pensados para convertir visitas en oportunidades reales.',
  },
  {
    icon: 'shield',
    title: 'Mantenimiento continuo',
    text: 'Hosting, SSL, backups y monitoreo para que tu web esté activa, segura y al día.',
  },
  {
    icon: 'users',
    title: 'Acompañamiento',
    text: 'Un equipo que te guía con un servicio integral: de la publicación a la monetización de tu presencia digital.',
  },
  {
    icon: 'chart',
    title: 'Crecimiento',
    text: 'SEO, campañas y seguimiento para atraer clientes y vender más desde la web.',
  },
];

export const websitePlanFaqs = [
  {
    q: '¿Qué es el servicio integral?',
    a: 'Hacemos la web, el mantenimiento y, en Advance, el SEO y los anuncios en un solo paquete. Sale más económico que contratar cada cosa por separado.',
  },
  {
    q: '¿Cuál es la diferencia entre Starter y Advance?',
    a: 'Starter es para tener y cuidar tu web. Advance suma SEO y/o Google Ads para que la web te ayude a vender.',
  },
  {
    q: '¿El SEO ayuda a vender?',
    a: 'Sí. Hace que te encuentren en Google cuando buscan lo que ofreces, con palabras clave, contenido y tu perfil de negocio.',
  },
  {
    q: '¿Por qué no hacerlo por separado?',
    a: 'Porque pagar web, hosting, SEO y anuncios cada uno por su lado sale más caro y se desordena. Aquí va todo junto, en una financiación mensual.',
  },
  {
    q: '¿Es un pago mensual o una financiación?',
    a: 'Es una financiación en cuotas mensuales: no pagas el proyecto de golpe. Puedes empezar en Starter y subir a Advance cuando quieras.',
  },
  {
    q: '¿El dominio está incluido?',
    a: 'En Website no. Desde Website Plus sí, junto con hosting, SSL y mantenimiento.',
  },
  {
    q: '¿La pauta de Google Ads está incluida?',
    a: 'No. En los planes con Leads nosotros armamos y cuidamos la campaña; lo que pagas a Google va aparte.',
  },
  {
    q: '¿Puedo cambiar de plan después?',
    a: 'Sí. Si empiezas con Website o Website Plus y luego quieres SEO o leads, subimos tu plan sin empezar de cero.',
  },
];
