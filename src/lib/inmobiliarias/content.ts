export const landingMeta = {
  title: 'Sistema de conversión de leads para inmobiliarias',
  description:
    'Convierte más leads inmobiliarios en conversaciones, visitas y oportunidades de venta. Diagnóstico de pipeline comercial para agencias y desarrolladores.',
  lastUpdated: '2026-08-21',
} as const;

export const heroCopy = {
  eyebrow: 'Para agencias y desarrolladores inmobiliarios',
  headline:
    'Tus leads inmobiliarios deberían recibir seguimiento antes de que terminen hablando con otra agencia.',
  subheadline:
    'Centralizamos, calificamos y automatizamos el seguimiento de oportunidades provenientes de portales, campañas, WhatsApp y tu website para que tu equipo comercial se concentre en los compradores con mayor intención.',
  cta: 'Analizar mi proceso comercial',
  micro: 'Diagnóstico inicial sin compromiso.',
} as const;

export const pipelineStages = [
  'Nuevo lead',
  'Contactado',
  'Calificado',
  'Visita',
  'Negociación',
  'Reserva',
  'Venta',
] as const;

export const problemBlocks = [
  {
    n: '01',
    text: 'El prospecto solicita información de una propiedad. El agente responde tres horas después. Para entonces ya habló con otras agencias.',
  },
  {
    n: '02',
    text: 'El mismo lead llega desde distintos portales y termina duplicado.',
  },
  {
    n: '03',
    text: 'El prospecto dice: “Estoy buscando para dentro de seis meses.” Y desaparece completamente del radar.',
  },
  {
    n: '04',
    text: 'El cliente visita una propiedad y nadie realiza un seguimiento estructurado después.',
  },
  {
    n: '05',
    text: 'La dirección recibe cientos de leads, pero no sabe cuáles terminaron en visita, reserva o venta.',
  },
] as const;

export const qualificationFields = [
  'Compra / alquiler',
  'Zona',
  'Presupuesto',
  'Tipo de propiedad',
  'Habitaciones',
  'Fecha estimada',
  'Financiación',
  'Residencia / inversión',
  'Idioma',
  'Disponibilidad para visita',
] as const;

export const leadScores = [
  {
    level: 'HOT',
    text: 'Quiere comprar pronto. Presupuesto definido. Solicita visita.',
  },
  {
    level: 'WARM',
    text: 'Interesado. Compra futura. Necesita financiación o definir opciones.',
  },
  {
    level: 'LONG TERM',
    text: 'Busca información. Plazo mayor.',
  },
] as const;

export const assignmentVars = [
  'Zona',
  'Proyecto',
  'Idioma',
  'Tipo de inmueble',
  'Presupuesto',
  'Disponibilidad',
  'Round robin',
  'Especialidad',
] as const;

export const visitFeatures = [
  'Agenda',
  'Selección de horarios',
  'Confirmaciones',
  'Recordatorios',
  'Ubicación e instrucciones',
  'Reprogramación',
] as const;

export const postVisitFlow = [
  { day: 'Día 0', text: 'Agradecimiento' },
  { day: 'Día siguiente', text: 'Feedback de la visita' },
  { day: 'Seguimiento', text: '¿Le gustó? ¿Precio? ¿Ubicación? ¿Financiación? ¿Quiere alternativas?' },
] as const;

export const nurturingBuckets = [
  { range: '0–30 días', label: 'Alta intención' },
  { range: '1–3 meses', label: 'Seguimiento periódico' },
  { range: '3–6 meses', label: 'Nurturing' },
  { range: '6–12 meses', label: 'Oportunidad de largo plazo' },
] as const;

export const discardReasons = [
  'Precio',
  'Tamaño',
  'Ubicación',
  'Mantenimiento',
  'Financiación',
  'Fecha',
] as const;

export const implementationSteps = [
  { n: '01', title: 'Diagnóstico', text: 'Mapeamos el proceso comercial actual.' },
  { n: '02', title: 'Configuración', text: 'Diseñamos etapas y reglas.' },
  { n: '03', title: 'Automatización', text: 'Construimos workflows.' },
  { n: '04', title: 'Integración', text: 'Conectamos canales.' },
  { n: '05', title: 'Optimización', text: 'Analizamos comportamiento y ajustamos.' },
] as const;

export const responseTimes = [
  { id: 'Lead 001', time: '2 minutos' },
  { id: 'Lead 002', time: '14 minutos' },
  { id: 'Lead 003', time: '3 horas' },
] as const;

export const companyTypes = [
  { label: 'Agencia inmobiliaria', value: 'agencia' },
  { label: 'Desarrollador / promotora', value: 'desarrollador' },
  { label: 'Broker', value: 'broker' },
  { label: 'Equipo comercial', value: 'equipo' },
  { label: 'Otro', value: 'otro' },
] as const;

export const agentBuckets = [
  { label: '1', value: '1' },
  { label: '2–5', value: '2-5' },
  { label: '6–10', value: '6-10' },
  { label: '11–25', value: '11-25' },
  { label: '25+', value: '25+' },
] as const;

export const leadBuckets = [
  { label: 'Menos de 25', value: '<25' },
  { label: '25–50', value: '25-50' },
  { label: '51–100', value: '51-100' },
  { label: '101–250', value: '101-250' },
  { label: '250+', value: '250+' },
] as const;

export const leadSources = [
  'Portales inmobiliarios',
  'Meta Ads',
  'Google Ads',
  'Website',
  'WhatsApp',
  'Instagram',
  'Referidos',
  'Desarrollos / proyectos',
  'Otro',
] as const;

export const mainProblems = [
  { label: 'Respuesta lenta', value: 'respuesta' },
  { label: 'Demasiados leads sin calificar', value: 'calificacion' },
  { label: 'Seguimiento', value: 'seguimiento' },
  { label: 'Baja conversión a visita', value: 'visita' },
  { label: 'Seguimiento después de visita', value: 'postvisita' },
  { label: 'Leads antiguos', value: 'antiguos' },
  { label: 'Reporting', value: 'reporting' },
  { label: 'Asignación de agentes', value: 'asignacion' },
] as const;

export const crmOptions = [
  'Software inmobiliario',
  'CRM genérico',
  'Excel / hojas de cálculo',
  'WhatsApp + notas',
  'MLS / portal',
  'Otro / varios',
  'Ninguno',
] as const;

export const faqs = [
  {
    q: '¿Tenemos que cambiar nuestro CRM?',
    a: 'No necesariamente. El sistema puede operar como capa de captación, automatización y seguimiento, y conectarse con herramientas existentes cuando sea viable.',
  },
  {
    q: '¿Se integra con portales inmobiliarios?',
    a: 'Depende de las APIs e integraciones disponibles en cada mercado y plataforma. Se evalúa caso por caso.',
  },
  {
    q: '¿Puede distribuir leads entre agentes?',
    a: 'Sí. Se pueden definir reglas por zona, proyecto, idioma, presupuesto, especialidad o round robin.',
  },
  {
    q: '¿Puede atender compradores fuera de horario?',
    a: 'Se puede configurar atención inicial automatizada y pasar al equipo cuando haga falta.',
  },
  {
    q: '¿Puede agendar visitas?',
    a: 'Sí, según el calendario y el proceso del equipo comercial.',
  },
  {
    q: '¿Puede trabajar compradores internacionales?',
    a: 'Sí. Especialmente útil en mercados con inversión extranjera y ventas a distancia.',
  },
  {
    q: '¿Puede reactivar leads antiguos?',
    a: 'Sí, con base legal y consentimiento adecuados para esas comunicaciones.',
  },
  {
    q: '¿Es un chatbot?',
    a: 'El asistente conversacional es una pieza. El núcleo es el proceso comercial completo: calificación, visitas, seguimiento y reporting.',
  },
] as const;

export const responseTimePromise =
  'Respondemos el diagnóstico en menos de 1 día hábil.';
