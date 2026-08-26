import type {
  LandingBenefit,
  LandingHeroContent,
  LandingProblem,
  LandingSectionCopy,
  LandingStep,
} from '@/lib/landings/types';

export const landingMeta = {
  title: 'Qué puede hacer la IA para tu inmobiliaria | Cluster Media',
  description:
    'Sistema automatizado para organizar respuestas, visitas y seguimiento comercial en agencias y desarrolladores inmobiliarios.',
  lastUpdated: '2026-08-24',
} as const;

export const heroCopy: LandingHeroContent = {
  eyebrow: 'Agencias y desarrolladores inmobiliarios',
  headline: '¿Qué puede hacer la IA para tu inmobiliaria?',
  headlineHighlight: 'inmobiliaria',
  subheadline:
    'Un sistema automatizado organiza la respuesta y el seguimiento de leads de portales, campañas y WhatsApp para que tu equipo se enfoque en compradores con intención real.',
  impactStat:
    'En promedio, la sistematización y automatización de los canales aumentan al menos el 18% el cierre de las ventas.',
  impactStatHighlight: 'ventas',
  calculatorLinkLabel: 'Haz el cálculo del impacto',
  sideCaption: 'Más visitas y cierres con el mismo equipo comercial.',
};

export const sections: LandingSectionCopy = {
  video: {
    eyebrow: 'Así se ve en acción',
    title: 'El sistema trabajando por tu equipo comercial.',
    description:
      'Respuesta, seguimiento y orden — sin depender de que un agente esté siempre disponible.',
  },
  problem: {
    eyebrow: 'El problema',
    title: 'Los leads llegan. El seguimiento no escala.',
    description:
      'En inmobiliario gana quien responde primero y mantiene el contacto después de la visita.',
  },
  solution: {
    eyebrow: 'La solución',
    title: 'Que tus ventas dependan menos de personas y más de tu sistema.',
    description:
      'Menos leads duplicados, más visitas agendadas y seguimiento claro después de cada recorrido.',
  },
  cases: {
    eyebrow: 'Prueba social',
    title: 'Casos de éxito',
    description:
      'Resultados reales de clientes de Cluster en captación, seguimiento y automatización comercial.',
  },
  steps: {
    eyebrow: 'Cómo funciona',
    title: 'Proceso fácil y ágil',
    description: 'Cuatro fases claras para tu agencia o desarrolladora.',
  },
  pricing: {
    eyebrow: 'Próximo paso',
    title: 'Empezamos con un diagnóstico de dónde se pierden tus ventas.',
    description:
      'Grandes o pequeñas: primero entendemos tu proceso. Luego diseñamos el sistema a tu medida — sin publicar precios genéricos.',
  },
  contact: {
    eyebrow: 'Contacto',
    title: 'Hablemos de tu operación comercial.',
    description: 'WhatsApp, llamada o formulario breve. Tú eliges.',
  },
};

export const problems: readonly LandingProblem[] = [
  {
    title: 'Respuesta lenta = lead perdido',
    text: 'El prospecto pide información de una propiedad y recibe respuesta horas después. Para entonces ya habló con otras agencias.',
  },
  {
    title: 'Leads duplicados y desordenados',
    text: 'El mismo comprador llega por varios portales. Sin un solo lugar, nadie sabe quién lo atendió ni en qué etapa está.',
  },
  {
    title: 'Visitas sin seguimiento',
    text: 'Recorren la propiedad y no hay un proceso claro para retomar interés, objeciones o alternativas.',
  },
];

export const benefits: readonly LandingBenefit[] = [
  {
    title: 'Respuesta inmediata',
    text: 'Atención inicial en minutos, incluso fuera de horario. El agente entra cuando hay intención real.',
    highlight: 'Velocidad comercial',
  },
  {
    title: 'Prioridad clara',
    text: 'Tu equipo ve qué leads están listos para visita y cuáles necesitan nurturing, sin perder ninguno.',
    highlight: 'Mejor uso del tiempo',
  },
  {
    title: 'Visibilidad para dirección',
    text: 'Sabe cuántos leads llegaron, cuántos visitaron y cuántos avanzaron a negociación.',
    highlight: 'Decisiones con datos',
  },
];

export const howItWorks: readonly LandingStep[] = [
  {
    n: '01',
    title: 'Diagnóstico',
    text: 'Mapeamos fuentes de leads, tiempos de respuesta y puntos donde se pierden visitas.',
  },
  {
    n: '02',
    title: 'Diseño',
    text: 'Definimos etapas, mensajes y reglas de asignación que el equipo comercial adopta.',
  },
  {
    n: '03',
    title: 'Implementación',
    text: 'Conectamos portales, campañas y WhatsApp. Probamos escenarios reales.',
  },
  {
    n: '04',
    title: 'Optimización',
    text: 'Medimos lead → visita → venta y ajustamos lo que frena la conversión.',
  },
];

export const pricingBullets = [
  'Mapa de dónde se caen tus leads y visitas',
  'Prioridades claras según volumen y canales',
  'Propuesta de sistema a la medida (sin precio genérico)',
  'Siguiente paso concreto para sistematizar ventas',
] as const;

export const caseStudySlugs = [
  'car-depot',
  'ink-express',
  'clinicas-medicas-ojine',
] as const;

export const calculatorNudge =
  '¿No sabes estos datos? Esa sería la primera señal de que necesitas sistematizar tus ventas.';

export const faqs = [
  {
    q: '¿Tenemos que cambiar nuestro CRM?',
    a: 'No necesariamente. Podemos operar como capa de captación y seguimiento e integrarnos cuando sea viable.',
  },
  {
    q: '¿Se integra con portales inmobiliarios?',
    a: 'Depende del mercado y las APIs disponibles. Lo evaluamos en el diagnóstico.',
  },
  {
    q: '¿Puede distribuir leads entre agentes?',
    a: 'Sí, por zona, proyecto, idioma, presupuesto o round robin.',
  },
  {
    q: '¿Funciona fuera de horario?',
    a: 'Sí. Atención inicial automatizada y paso al agente cuando corresponde.',
  },
  {
    q: '¿Es solo un chatbot?',
    a: 'No. El chat es una pieza. El núcleo es el proceso comercial completo.',
  },
] as const;

export const pipelineStages = [
  'Lead',
  'Contacto',
  'Visita',
  'Venta',
] as const;
