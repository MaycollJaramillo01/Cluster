// Configuración central del sitio de Cluster Media.
// Cambia estos valores en un solo lugar y se actualizan en todo el website.

export const site = {
  name: 'Cluster Media',
  shortName: 'Cluster',
  domain: 'https://clustermedia.com',
  url: 'https://clustermedia.com',
  email: 'info@cluster.marketing',
  phoneDisplay: '(305) 479-9896',
  whatsappNumber: '13054799896', // sin signos, para wa.me
  calendarUrl: 'https://calendly.com/clustermedia/llamada', // reemplazar por el embed real
  location: 'Miami, FL · Estados Unidos',
  tagline: 'Comunicación digital que conecta con tu audiencia.',
  description:
    'Construimos marcas, contenido, campañas, websites y automatizaciones para conectar con audiencias reales y generar crecimiento.',
  social: {
    instagram: 'https://instagram.com/clustermedia',
    facebook: 'https://facebook.com/clustermedia',
    linkedin: 'https://linkedin.com/company/clustermedia',
    youtube: 'https://youtube.com/@clustermedia',
  },
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsappNumber}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`;

// ─────────────────────────────────────────────────────────────
// Navegación principal
// ─────────────────────────────────────────────────────────────
export const mainNav = [
  { label: 'Inicio', href: '/' },
  {
    label: 'Servicios',
    href: '/servicios',
    children: [
      { label: 'Branding', href: '/branding' },
      { label: 'Redes Sociales', href: '/redes-sociales' },
      { label: 'Google Ads', href: '/google-ads' },
      { label: 'IA / Automatizaciones', href: '/automatizaciones-ia' },
      { label: 'Websites / SEO', href: '/websites-seo' },
      { label: 'SEO Audit', href: '/seo-audit' },
    ],
  },
  { label: 'Ruta Local', href: '/ruta-local' },
  { label: 'Planes', href: '/#planes' },
  { label: 'Casos de Éxito', href: '/casos-de-exito' },
  { label: 'Sobre Cluster', href: '/sobre-cluster' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
] as const;

// ─────────────────────────────────────────────────────────────
// Servicios (usados en Home y página de Servicios)
// ─────────────────────────────────────────────────────────────
export type Service = {
  slug: string;
  href: string;
  name: string;
  short: string;
  description: string;
  features: string[];
  price?: string;
  cta: string;
  icon: string;
};

export const services: Service[] = [
  {
    slug: 'branding',
    href: '/branding',
    name: 'Branding',
    short: 'Construye una marca profesional desde la base.',
    description:
      'Logotipo, manual de marca e identidad visual para que tu negocio se vea profesional y confiable.',
    features: [
      'Logotipo y versiones',
      'Manual de marca',
      'Identidad visual',
      'Línea gráfica',
      'Aplicaciones básicas',
    ],
    cta: 'Ver Branding',
    icon: 'sparkles',
  },
  {
    slug: 'paquetes-mensuales',
    href: '/#planes',
    name: 'Paquetes mensuales',
    short: 'Planes de contenido, campañas y crecimiento según tu etapa.',
    description:
      'Paquetes Next, Advance, Enterprise y Cluster con redes sociales, stories, Google, Meta Ads, asesoría, website y SEO según el nivel elegido.',
    features: [
      'Contenido mensual',
      'Stories y reels',
      'Campañas Meta',
      'Campañas Google',
      'Asesoría de marketing',
      'Website y SEO según plan',
    ],
    price: 'Desde USD 480/mes',
    cta: 'Ver planes',
    icon: 'rocket',
  },
  {
    slug: 'redes-sociales',
    href: '/redes-sociales',
    name: 'Redes Sociales / Contenido',
    short: 'Contenido cercano, real y distinto para conectar con tu audiencia.',
    description:
      'Manejo de redes sociales, reels, artes, stories, campañas Meta y estrategia mensual para construir conexión y generar oportunidades.',
    features: [
      'Creación de contenido',
      'Reels y artes',
      'Carruseles',
      'Campañas Meta',
      'Asesoría mensual',
    ],
    cta: 'Ver paquetes',
    icon: 'megaphone',
  },
  {
    slug: 'google-ads',
    href: '/google-ads',
    name: 'Google Ads / Performance',
    short: 'Aparece cuando tus clientes ya están buscando tus servicios.',
    description:
      'Gestión mensual de campañas para aparecer cuando tus clientes ya están buscando tus servicios.',
    features: [
      'Configuración de campañas',
      'Gestión mensual',
      'Optimización continua',
      'Investigación de keywords',
      'Seguimiento de resultados',
    ],
    price: 'Desde USD 150/mes',
    cta: 'Quiero Google Ads',
    icon: 'target',
  },
  {
    slug: 'automatizaciones-ia',
    href: '/automatizaciones-ia',
    name: 'IA / Automatizaciones',
    short: 'Responde más rápido y pierde menos leads.',
    description:
      'Automatiza WhatsApp, Messenger, Instagram Inbox y el seguimiento de tus leads con IA y CRM.',
    features: [
      'WhatsApp automatizado',
      'Agentes IA',
      'CRM',
      'Workflows',
      'Seguimiento automático',
    ],
    cta: 'Ver automatizaciones',
    icon: 'bot',
  },
  {
    slug: 'websites-seo',
    href: '/websites-seo',
    name: 'Websites / SEO',
    short: 'Websites diseñados para verse bien y generar contactos.',
    description:
      'Websites, dominios, landing pages, SEO y estructura de conversión integrada con CRM, funnels y email corporativo.',
    features: [
      'Websites informativos',
      'Landing pages',
      'SEO básico',
      'Formularios',
      'Integración con CRM',
    ],
    cta: 'Ver websites',
    icon: 'globe',
  },
  {
    slug: 'seo-audit',
    href: '/seo-audit',
    name: 'SEO Audit',
    short: 'Diagnostico rapido para saber que esta frenando tu website.',
    description:
      'Auditoria SEO con IA para detectar problemas tecnicos, contenido debil, oportunidades locales y mejoras de conversion.',
    features: [
      'Analisis tecnico',
      'Revision de contenido',
      'SEO local',
      'Conversion',
      'Prioridades accionables',
    ],
    cta: 'Auditar website',
    icon: 'search',
  },
];

// ─────────────────────────────────────────────────────────────
// Planes / Precios (sección "Elegí el plan para vos")
// ─────────────────────────────────────────────────────────────
export type PricingPlan = {
  name: string;
  kicker: string; // etiqueta mono sobre el nombre
  price: string;
  period?: string; // ej. '/mes'
  note: string;
  features: string[];
  cta: string;
  whatsapp: string;
  highlight?: boolean;
  badge?: string;
};

export const plans: PricingPlan[] = [
  {
    name: 'Next',
    kicker: 'Mensual',
    price: 'USD 480',
    period: '/mes',
    note: 'Contenido y campañas para empezar con estructura',
    features: [
      'Contenido para 2 redes sociales',
      '3 piezas de contenido semanales',
      '12 piezas mensuales',
      '1 campaña de Meta Ads',
      '1 campaña de Google Ads',
    ],
    cta: 'Elegir plan',
    whatsapp: 'Hola, quiero el paquete Next (USD 480).',
  },
  {
    name: 'Advance',
    kicker: 'Mensual',
    price: 'USD 680',
    period: '/mes',
    note: 'Más contenido, stories y asesoría mensual',
    highlight: true,
    badge: 'Recomendado',
    features: [
      'Contenido para 3 redes sociales',
      '5 piezas semanales / 20 mensuales',
      '3 stories semanales / 12 mensuales',
      'Gestión de perfil de negocio en Google',
      '1 campaña de Google',
      '3 campañas de Meta al mes',
      'Asesoría de marketing',
    ],
    cta: 'Elegir plan',
    whatsapp: 'Hola, quiero el paquete Advance (USD 680).',
  },
  {
    name: 'Enterprise',
    kicker: 'Mensual',
    price: 'USD 780',
    period: '/mes',
    note: 'Gestión más completa para marcas en crecimiento',
    features: [
      'Contenido para hasta 4 redes sociales',
      '5 piezas semanales / 20 mensuales',
      '4 stories semanales / 16 mensuales',
      '3 campañas de Google',
      'Actualización de website',
      'Gestión de perfil de negocio en Google',
      '3 campañas de Meta al mes',
      'Asesoría de marketing',
    ],
    cta: 'Elegir plan',
    whatsapp: 'Hola, quiero el paquete Enterprise (USD 780).',
  },
  {
    name: 'Cluster',
    kicker: 'Mensual',
    price: 'USD 900',
    period: '/mes',
    note: 'El sistema más completo de contenido, campañas y SEO',
    features: [
      'Contenido para hasta 4 redes sociales',
      '6 piezas semanales / 24 mensuales',
      '5 stories semanales / 20 mensuales',
      'Actualización de website',
      'Perfil de negocio en Google',
      '3 campañas de Google',
      '5 campañas de Meta al mes',
      'Asesoría de marketing',
      'SEO',
    ],
    cta: 'Elegir plan',
    whatsapp: 'Hola, quiero el paquete Cluster (USD 900).',
  },
];

// ─────────────────────────────────────────────────────────────
// Paquetes de Redes Sociales
// ─────────────────────────────────────────────────────────────
export type Plan = {
  name: string;
  price: string;
  period: string;
  highlight?: boolean;
  features: string[];
};

export const socialPlans: Plan[] = [
  {
    name: 'Next',
    price: 'USD 480',
    period: '/mes',
    features: [
      'Contenido para 2 redes sociales',
      '3 piezas de contenido semanales',
      '12 piezas mensuales',
      '1 campaña de Meta Ads',
      '1 campaña de Google Ads',
    ],
  },
  {
    name: 'Advance',
    price: 'USD 680',
    period: '/mes',
    highlight: true,
    features: [
      'Contenido para 3 redes sociales',
      '5 piezas de contenido semanales',
      '20 piezas mensuales',
      '3 stories semanales (12 al mes)',
      'Gestión de perfil de Google',
      '1 campaña de Google + 3 de Meta al mes',
      'Asesoría de marketing',
    ],
  },
  {
    name: 'Enterprise',
    price: 'USD 780',
    period: '/mes',
    features: [
      'Contenido para hasta 4 redes sociales',
      '5 piezas de contenido semanales',
      '20 piezas mensuales',
      '4 stories semanales (16 al mes)',
      '3 campañas de Google',
      'Actualización de website',
      'Gestión de perfil de Google',
      '3 campañas de Meta al mes',
      'Asesoría de marketing',
    ],
  },
  {
    name: 'Cluster',
    price: 'USD 900',
    period: '/mes',
    features: [
      'Contenido para hasta 4 redes sociales',
      '6 piezas de contenido semanales',
      '24 piezas mensuales',
      '5 stories semanales (20 al mes)',
      'Actualización de website',
      'Gestión de perfil de Google',
      '3 campañas de Google + 5 de Meta al mes',
      'Asesoría de marketing',
      'SEO',
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Casos de éxito
// ─────────────────────────────────────────────────────────────
export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  summary: string;
  text: string;
  metric: { value: string; label: string };
  services: string[];
  industry: string;
  image: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'car-depot',
    client: 'Car Depot',
    title: 'Generación constante de leads para venta de vehículos',
    summary: 'Campañas y estrategia digital para un negocio de vehículos en EE. UU.',
    text: 'Después de dos meses de trabajo, ayudamos a un negocio de vehículos en Estados Unidos a generar alrededor de 20 leads diarios mediante campañas y estrategia digital.',
    metric: { value: '~20', label: 'leads diarios' },
    services: ['Campañas', 'Redes sociales', 'Generación de leads', 'Seguimiento comercial'],
    industry: 'Automotriz',
    image: '/assets/stock/automotive.jpg',
  },
  {
    slug: 'clinicas-medicas-ojine',
    client: 'Clínicas Médicas Ojíne',
    title: 'Comunicación digital para servicios de salud',
    summary: 'Presencia digital y comunicación para una marca médica.',
    text: 'Apoyamos a una marca médica a fortalecer su presencia digital, comunicar mejor sus servicios y conectar con pacientes potenciales.',
    metric: { value: '+Presencia', label: 'digital y pacientes' },
    services: ['Redes sociales', 'Contenido', 'Diseño', 'Estrategia'],
    industry: 'Salud',
    image: '/assets/stock/medical.jpg',
  },
  {
    slug: 'ink-express',
    client: 'Ink Express',
    title: 'Automatización para atender mejor a sus clientes',
    summary: 'Automatización, CRM y seguimiento para alto volumen de mensajes.',
    text: 'Una tienda con alto volumen de mensajes necesitaba mejorar su atención y ordenar sus oportunidades comerciales. La solución se enfocó en automatización, CRM y seguimiento.',
    metric: { value: '−Carga', label: 'operativa con IA' },
    services: ['IA', 'WhatsApp automatizado', 'CRM', 'Workflows'],
    industry: 'Retail',
    image: '/assets/stock/retail.jpg',
  },
];

// Marcas que han confiado en Cluster Media (prueba social).
// Los logos se sirven desde /public/assets/logos para que Next pueda optimizarlos.
export type Client = { name: string; logo: string };

export const clients: Client[] = [
  { name: "Arnie's", logo: '/assets/logos/arnies-transparent.png' },
  {
    name: 'Clínicas Médicas Ojíne',
    logo: '/assets/logos/clinicas-medicas-ojine-transparent.png',
  },
  { name: 'DermaPiel', logo: '/assets/logos/dermapiel-transparent.png' },
  { name: 'Ink Express', logo: '/assets/logos/ink-express-transparent.png' },
  { name: 'Kielsa', logo: '/assets/logos/kielsa.webp' },
  { name: 'Luxo Boutique', logo: '/assets/logos/luxo-boutique-transparent.png' },
  { name: 'Seguros Atlántida', logo: '/assets/logos/seguros-atlantida.svg' },
  { name: 'Travel Diunsa', logo: '/assets/logos/travel-diunsa-transparent.png' },
];

// ─────────────────────────────────────────────────────────────
// Blog (artículos recomendados del roadmap)
// ─────────────────────────────────────────────────────────────
export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingTime: string;
};

export const blogCategories = [
  'Marketing para negocios hispanos',
  'Google Ads',
  'Redes sociales',
  'Branding',
  'Automatización e IA',
  'Websites y SEO',
  'Casos de éxito',
];

export const articles: Article[] = [
  {
    slug: 'negocio-hispano-mas-clientes-online',
    title: 'Cómo hacer que un negocio hispano en Estados Unidos consiga más clientes online',
    category: 'Marketing para negocios hispanos',
    excerpt:
      'Una guía práctica para pasar de depender de referidos a construir un sistema digital que genere clientes de forma constante.',
    readingTime: '7 min',
  },
  {
    slug: 'depender-solo-de-referidos',
    title: 'Por qué depender solo de referidos puede frenar el crecimiento de tu negocio',
    category: 'Marketing para negocios hispanos',
    excerpt:
      'Los referidos son valiosos, pero no son escalables. Te explicamos cómo complementar el boca a boca con presencia digital.',
    readingTime: '5 min',
  },
  {
    slug: 'google-ads-vs-redes-sociales',
    title: 'Google Ads vs redes sociales: cuál conviene más para tu negocio',
    category: 'Google Ads',
    excerpt:
      'Intención de búsqueda vs construcción de marca. Aprende cuándo invertir en cada canal según tu tipo de negocio.',
    readingTime: '6 min',
  },
  {
    slug: 'website-profesional-genera-clientes',
    title: 'Qué debe tener un website profesional para generar clientes',
    category: 'Websites y SEO',
    excerpt:
      'Estructura, velocidad, claridad y conversión: los elementos que separan un sitio que vende de uno que solo informa.',
    readingTime: '8 min',
  },
  {
    slug: 'automatizar-whatsapp-no-perder-leads',
    title: 'Cómo automatizar WhatsApp para no perder leads',
    category: 'Automatización e IA',
    excerpt:
      'Responder tarde cuesta clientes. Te mostramos cómo la automatización y la IA ayudan a dar seguimiento sin perder oportunidades.',
    readingTime: '6 min',
  },
  {
    slug: 'tu-marca-se-ve-profesional',
    title: 'Cómo saber si tu marca se ve profesional',
    category: 'Branding',
    excerpt:
      'Una checklist honesta para evaluar si tu logo, colores y comunicación generan confianza o están restando clientes.',
    readingTime: '5 min',
  },
  {
    slug: 'marketing-construccion-estados-unidos',
    title: 'Marketing digital para empresas de construcción en Estados Unidos',
    category: 'Marketing para negocios hispanos',
    excerpt:
      'Roofing, remodelación y construcción: cómo generar leads cualificados con Google Ads y una presencia digital sólida.',
    readingTime: '7 min',
  },
];
