export const landingMeta = {
  title: 'Sistema de conversión para clínicas de medicina estética',
  description:
    'Convierte más consultas en citas y más citas en tratamientos. Diagnóstico de conversión de pacientes para clínicas de medicina estética.',
  lastUpdated: '2026-08-21',
} as const;

export const heroCopy = {
  eyebrow: 'Para clínicas de medicina estética',
  headline: 'Convierte más consultas en citas y más citas en tratamientos.',
  subheadline:
    'Centralizamos y automatizamos el seguimiento de tus prospectos desde que llegan por Meta, Google, Instagram, WhatsApp o tu web hasta que reservan, asisten y avanzan hacia un tratamiento.',
  cta: 'Analizar mi proceso de conversión',
  ctaAlt: 'Quiero descubrir dónde pierdo pacientes',
  micro: 'Diagnóstico inicial sin compromiso.',
} as const;

export const pipelineStages = [
  'Nueva consulta',
  'Conversación',
  'Cita',
  'Asistencia',
  'Tratamiento',
  'Recurrencia',
] as const;

export const problemBlocks = [
  {
    n: '01',
    text: 'Una consulta entra fuera de horario y nadie responde hasta el día siguiente.',
  },
  {
    n: '02',
    text: 'El prospecto pregunta precio, recibe información y desaparece.',
  },
  {
    n: '03',
    text: 'Reserva una cita, pero nadie confirma correctamente su asistencia.',
  },
  {
    n: '04',
    text: 'No se presenta y no existe un proceso sistemático para recuperarlo.',
  },
  {
    n: '05',
    text: 'Recibe una valoración o presupuesto y nadie vuelve a darle seguimiento.',
  },
  {
    n: '06',
    text: 'Un paciente termina su tratamiento y nunca recibe una campaña de reactivación.',
  },
] as const;

export const systemModules = [
  {
    title: 'Respuesta inicial',
    text: 'Atención inmediata a nuevas consultas.',
  },
  {
    title: 'Calificación',
    text: 'Recopila información comercial necesaria antes de intervenir manualmente.',
  },
  {
    title: 'Agenda',
    text: 'Facilita reserva de citas.',
  },
  {
    title: 'Recordatorios',
    text: 'Reduce olvidos y facilita confirmación o reprogramación.',
  },
  {
    title: 'Recuperación de no-shows',
    text: 'Secuencia específica para pacientes que no asistieron.',
  },
  {
    title: 'Seguimiento post-valoración',
    text: 'Mantiene conversación con pacientes que todavía no decidieron iniciar tratamiento.',
  },
  {
    title: 'Reactivación',
    text: 'Vuelve a contactar pacientes anteriores cuando corresponde comercialmente.',
  },
  {
    title: 'Reseñas',
    text: 'Solicitud automatizada a pacientes satisfechos según el flujo definido.',
  },
  {
    title: 'Pipeline',
    text: 'Cada oportunidad tiene una etapa visible.',
  },
  {
    title: 'Reporting',
    text: 'Permite conocer qué canales producen citas y tratamientos.',
  },
] as const;

export const followUpPipeline = [
  'Consulta',
  'Cita reservada',
  'Asistió',
  'Tratamiento recomendado',
  'En decisión',
  'Tratamiento iniciado',
  'Recurrencia',
] as const;

export const followUpExamples = [
  'Seguimiento 24–48 horas después de la valoración',
  'Recordatorio de propuesta',
  'Información adicional',
  'Posibilidad de resolver dudas',
  'Opciones de financiación si la clínica dispone de ellas',
  'Intervención humana cuando existe intención',
] as const;

export const handoffExamples = [
  'Pregunta compleja',
  'Paciente con intención alta',
  'Consulta sensible',
  'Negociación',
  'Solicitud clínica',
  'Reclamación',
] as const;

export const implementationSteps = [
  {
    n: '01',
    title: 'Diagnóstico',
    text: 'Mapeamos el recorrido comercial actual.',
  },
  {
    n: '02',
    title: 'Diseño',
    text: 'Definimos pipeline, mensajes, automatizaciones y reglas.',
  },
  {
    n: '03',
    title: 'Integración',
    text: 'Conectamos canales y herramientas necesarias.',
  },
  {
    n: '04',
    title: 'Lanzamiento',
    text: 'Probamos todos los escenarios.',
  },
  {
    n: '05',
    title: 'Optimización',
    text: 'Analizamos conversiones y ajustamos.',
  },
] as const;

export const integrations = [
  'Formularios web',
  'Meta',
  'Google',
  'WhatsApp',
  'Calendario',
  'CRM',
  'Software existente (cuando haya API)',
] as const;

export const demoLeads = [
  {
    id: 'Lead 001',
    source: 'Meta',
    status: 'Cita reservada',
    next: 'Confirmar',
  },
  {
    id: 'Lead 002',
    source: 'Instagram',
    status: 'Valoración realizada',
    next: 'Follow-up',
  },
  {
    id: 'Lead 003',
    source: 'Google',
    status: 'No-show',
    next: 'Recuperación',
  },
] as const;

export const sources = ['Meta', 'Google', 'Instagram', 'Web', 'WhatsApp'] as const;

export const consultationBuckets = [
  { label: 'Menos de 25', value: '<25' },
  { label: '25–50', value: '25-50' },
  { label: '51–100', value: '51-100' },
  { label: '101–250', value: '101-250' },
  { label: '250+', value: '250+' },
] as const;

export const leadSources = [
  'Meta Ads',
  'Instagram orgánico',
  'Google Ads',
  'Google Maps',
  'Website',
  'WhatsApp',
  'Referidos',
  'Otro',
] as const;

export const afterInquiryOptions = [
  { label: 'Recepción responde manualmente', value: 'recepcion' },
  { label: 'Equipo comercial', value: 'comercial' },
  { label: 'Chatbot', value: 'chatbot' },
  { label: 'CRM', value: 'crm' },
  { label: 'No existe un proceso uniforme', value: 'ninguno' },
] as const;

export const mainProblems = [
  { label: 'Tiempo de respuesta', value: 'respuesta' },
  { label: 'Leads que desaparecen', value: 'desaparecen' },
  { label: 'Baja agenda', value: 'agenda' },
  { label: 'No-shows', value: 'noshows' },
  { label: 'Pacientes que no compran después de valoración', value: 'cierre' },
  { label: 'Seguimiento', value: 'seguimiento' },
  { label: 'Reactivación', value: 'reactivacion' },
  { label: 'Medición', value: 'medicion' },
  { label: 'Otro', value: 'otro' },
] as const;

export const faqs = [
  {
    q: '¿Esto reemplaza nuestro software clínico?',
    a: 'Opera como capa de captación y seguimiento comercial. La historia clínica permanece en tu software clínico.',
  },
  {
    q: '¿Tenemos que cambiar nuestro WhatsApp?',
    a: 'Depende de la infraestructura actual y de la solución diseñada para tu clínica.',
  },
  {
    q: '¿Puede responder una persona?',
    a: 'Sí. Recepción y comerciales pueden tomar cualquier conversación en el momento que haga falta.',
  },
  {
    q: '¿La IA responde preguntas médicas?',
    a: 'Las preguntas clínicas se derivan al personal correspondiente. El sistema se configura para respetar el criterio médico.',
  },
  {
    q: '¿Sirve si hacemos publicidad en Meta y Google?',
    a: 'Sí. Está pensado para clínicas que ya invierten en captación y necesitan control sobre citas y tratamientos.',
  },
  {
    q: '¿Puede identificar qué campaña generó una cita?',
    a: 'Con las integraciones adecuadas se puede rastrear de anuncio a lead, cita y cliente.',
  },
  {
    q: '¿Puede ayudar con pacientes antiguos?',
    a: 'Sí, con base legal y consentimiento adecuados para esas comunicaciones.',
  },
  {
    q: '¿Es simplemente un chatbot?',
    a: 'El chatbot puede ser un componente. El núcleo es el proceso comercial completo: seguimiento, citas, recuperación y reporting.',
  },
] as const;

export const responseTimePromise =
  'Respondemos el diagnóstico en menos de 1 día hábil.';
