export type AgentContent = {
  locale: 'es' | 'en';
  hero: {
    eyebrow: string;
    title: [string, string];
    description: string;
    primary: string;
    secondary: string;
    note: string;
  };
  benefits: { title: string; text: string }[];
  capabilities: { title: string; text: string }[];
  industries: {
    title: string;
    description: string;
    questions: string[];
    outcome: string;
  }[];
  problems: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  comparison: { label: string; ai: string; traditional: string }[];
  faqs: { q: string; a: string }[];
  planFeatures: string[];
  meta: { title: string; description: string };
};

const es: AgentContent = {
  locale: 'es',
  hero: {
    eyebrow: 'Agentes IA para WhatsApp',
    title: ['Su negocio recibe prospectos.', 'Nuestro Agente IA se asegura de que no los pierda.'],
    description:
      'Responde, califica y da seguimiento automáticamente por WhatsApp, 24/7.',
    primary: 'Quiero automatizar mi WhatsApp',
    secondary: 'Ver videos por industria',
    note: 'Desde US$120/mes · Implementación personalizada',
  },
  benefits: [
    { title: 'Responde 24/7', text: 'Atiende consultas, incluso fuera de su horario.' },
    { title: 'Califica', text: 'Hace las preguntas que su equipo necesita para avanzar.' },
    { title: 'Da seguimiento', text: 'Retoma la conversación según el proceso que definamos.' },
    { title: 'Agenda', text: 'Coordina una cita según la disponibilidad de su calendario.' },
  ],
  capabilities: [
    { title: 'Atención automática', text: 'Responde consultas sobre sus servicios, horarios y preguntas frecuentes.' },
    { title: 'Calificación', text: 'Consulta necesidades, ubicación y presupuesto antes de pasar a su equipo.' },
    { title: 'Seguimiento', text: 'Retoma oportunidades con mensajes y tiempos definidos para su negocio.' },
    { title: 'Conversaciones que continúan', text: 'Acompaña a quien necesita más información antes de tomar una decisión.' },
    { title: 'Agenda de citas', text: 'Consulta disponibilidad y ayuda a coordinar el próximo paso.' },
    { title: 'Reactivación', text: 'Permite retomar prospectos anteriores cuando corresponde contactarlos.' },
    { title: 'Oportunidades organizadas', text: 'Centraliza los datos y el estado de cada conversación en su CRM.' },
    { title: 'Pase a su equipo', text: 'Deriva la conversación a una persona cuando necesita atención directa.' },
  ],
  industries: [
    {
      title: 'Inmobiliarias',
      description: 'De la primera consulta a una visita con contexto.',
      questions: ['¿Busca comprar o alquilar?', '¿En qué zona?', '¿Cuál es su presupuesto?'],
      outcome: 'Su asesor recibe la necesidad, la ubicación y el presupuesto para coordinar una visita.',
    },
    {
      title: 'Construcción',
      description: 'Conozca el proyecto antes de la primera llamada.',
      questions: ['¿Qué tipo de proyecto tiene?', '¿Dónde se realizaría?', '¿Cuándo le gustaría comenzar?'],
      outcome: 'El equipo comercial recibe los detalles iniciales y puede coordinar una llamada.',
    },
    {
      title: 'Clínicas médicas',
      description: 'Menos consultas administrativas pendientes.',
      questions: ['¿Qué servicio necesita?', '¿En qué sede?', '¿Qué horario le conviene?'],
      outcome: 'Orienta sobre servicios, horarios y citas; deriva las consultas clínicas al personal de salud.',
    },
    {
      title: 'Clínicas odontológicas',
      description: 'De la consulta sobre un servicio a una valoración.',
      questions: ['¿Sobre qué servicio desea información?', '¿Es su primera visita?', '¿Qué día le conviene?'],
      outcome: 'Comparte información de la clínica y ayuda a agendar una valoración con el profesional.',
    },
    {
      title: 'Estéticas',
      description: 'Atienda el interés mientras su equipo atiende en cabina.',
      questions: ['¿Qué servicio le interesa?', '¿Desea agendar una valoración?', '¿Qué horario prefiere?'],
      outcome: 'Informa sobre servicios, consulta disponibilidad y retoma solicitudes pendientes.',
    },
  ],
  problems: [
    { title: 'Le escriben fuera de horario.', text: 'La consulta queda pendiente hasta que su equipo vuelve a conectarse.' },
    { title: 'Preguntan precio y desaparecen.', text: 'La conversación termina sin un próximo paso.' },
    { title: 'Llegan varias consultas a la vez.', text: 'Entre mensajes y tareas, algunas oportunidades quedan sin atender.' },
    { title: 'Todavía no están listos.', text: 'Quien necesita más tiempo también necesita una conversación que continúe.' },
  ],
  steps: [
    { title: 'Entendemos su negocio', text: 'Revisamos sus servicios, preguntas frecuentes y proceso comercial.' },
    { title: 'Construimos su agente', text: 'Definimos su forma de responder, la información que usa y cuándo pasa a su equipo.' },
    { title: 'Preparamos el seguimiento', text: 'Configuramos los mensajes, la agenda y las acciones que su proceso necesita.' },
    { title: 'Lo ponemos a trabajar', text: 'Conectamos WhatsApp, probamos las conversaciones y ajustamos antes de activar.' },
  ],
  comparison: [
    { label: 'Atención 24/7', ai: 'Sí, configurada', traditional: 'Según horario' },
    { label: 'Primera respuesta', ai: 'Inmediata', traditional: 'Según disponibilidad' },
    { label: 'Conversaciones simultáneas', ai: 'Varias a la vez', traditional: 'Capacidad limitada' },
    { label: 'Seguimiento', ai: 'Automático', traditional: 'Manual' },
    { label: 'Nutrición de prospectos', ai: 'Automática', traditional: 'Manual' },
    { label: 'Calificación', ai: 'Según criterios definidos', traditional: 'Manual' },
    { label: 'Agenda', ai: 'Con calendario conectado', traditional: 'Manual' },
    { label: 'Constancia del proceso', ai: 'Sigue las reglas acordadas', traditional: 'Puede variar' },
    { label: 'Vacaciones y ausencias', ai: 'No aplica', traditional: 'Requiere cobertura' },
    { label: 'Obligaciones laborales', ai: 'No aplica', traditional: 'Sí' },
    { label: 'Casos que requieren criterio', ai: 'Deriva a una persona', traditional: 'Atención directa' },
  ],
  faqs: [
    {
      q: '¿Es un chatbot?',
      a: 'Es un agente con Inteligencia Artificial: puede interpretar preguntas, consultar la información de su empresa y responder según el contexto de la conversación, en lugar de limitarse a un menú de respuestas fijas.',
    },
    {
      q: '¿Puede dar seguimiento?',
      a: 'Sí. Configuramos mensajes y tiempos para retomar conversaciones, acompañar a prospectos que aún no están listos o reactivar oportunidades según su proceso comercial.',
    },
    {
      q: '¿Puede agendar citas?',
      a: 'Sí. Puede conectarse a un calendario y agendar según la disponibilidad y las reglas que definamos durante la implementación.',
    },
    {
      q: '¿Sirve para cualquier negocio?',
      a: 'Funciona especialmente bien en empresas que reciben consultas, prospectos o solicitudes de cotización de forma recurrente. Revisamos su proceso para determinar qué conviene automatizar y qué debe atender su equipo.',
    },
    {
      q: '¿Necesito cambiar mi número de WhatsApp?',
      a: 'Depende de la configuración actual de su cuenta. Nuestro equipo revisa su número y las opciones de conexión durante la implementación.',
    },
  ],
  planFeatures: [
    '1 Agente IA',
    'WhatsApp',
    'CRM',
    'Atención automática',
    'Base de conocimiento',
    'Hasta 1,000 respuestas de IA al mes',
    'Soporte técnico básico',
  ],
  meta: {
    title: 'Agentes IA para WhatsApp desde US$120/mes | Cluster Media',
    description: 'Responde, califica y da seguimiento a sus prospectos con un Agente IA para WhatsApp. Desde US$120 al mes. Implementación personalizada con Cluster Media.',
  },
};

const en: AgentContent = {
  locale: 'en',
  hero: {
    eyebrow: 'AI agents for WhatsApp',
    title: ['Your business gets prospects.', 'Our AI agent makes sure you do not lose them.'],
    description: 'Replies, qualifies and follows up automatically on WhatsApp, 24/7.',
    primary: 'Automate my WhatsApp',
    secondary: 'Watch industry videos',
    note: 'From US$120/month · Custom implementation',
  },
  benefits: [
    { title: 'Replies 24/7', text: 'Answers inquiries, including outside your business hours.' },
    { title: 'Qualifies leads', text: 'Asks the questions your team needs to move forward.' },
    { title: 'Follows up', text: 'Picks up the conversation based on your agreed process.' },
    { title: 'Books appointments', text: 'Coordinates a time based on your calendar availability.' },
  ],
  capabilities: [
    { title: 'Automatic replies', text: 'Answers questions about your services, opening hours and common requests.' },
    { title: 'Lead qualification', text: 'Asks about needs, location and budget before handing over to your team.' },
    { title: 'Follow-up', text: 'Revisits opportunities with messages and timing defined for your business.' },
    { title: 'Ongoing conversations', text: 'Helps people who need more information before making a decision.' },
    { title: 'Appointment booking', text: 'Checks availability and helps coordinate the next step.' },
    { title: 'Reactivation', text: 'Lets you reconnect with earlier prospects when contact is appropriate.' },
    { title: 'Organized opportunities', text: 'Keeps contact details and conversation status together in your CRM.' },
    { title: 'Human handoff', text: 'Passes the conversation to a person when direct attention is needed.' },
  ],
  industries: [
    {
      title: 'Real estate',
      description: 'From the first inquiry to a viewing with context.',
      questions: ['Are you looking to buy or rent?', 'Which area interests you?', 'What is your budget?'],
      outcome: 'Your advisor receives the requirements, location and budget to arrange a viewing.',
    },
    {
      title: 'Construction',
      description: 'Understand the project before the first call.',
      questions: ['What kind of project are you planning?', 'Where would it be built?', 'When would you like to start?'],
      outcome: 'Your sales team receives the initial details and can coordinate a call.',
    },
    {
      title: 'Medical clinics',
      description: 'Fewer administrative inquiries left waiting.',
      questions: ['Which service do you need?', 'Which location works for you?', 'What time suits you?'],
      outcome: 'Shares service, opening-hour and booking information; passes clinical questions to healthcare staff.',
    },
    {
      title: 'Dental clinics',
      description: 'From a question about a service to an assessment.',
      questions: ['Which service would you like to know about?', 'Is this your first visit?', 'Which day works for you?'],
      outcome: 'Shares clinic information and helps book an assessment with a professional.',
    },
    {
      title: 'Aesthetic clinics',
      description: 'Answer new inquiries while your team attends appointments.',
      questions: ['Which service interests you?', 'Would you like to book a consultation?', 'What time do you prefer?'],
      outcome: 'Shares service information, checks availability and follows up on pending inquiries.',
    },
  ],
  problems: [
    { title: 'They message after hours.', text: 'The inquiry waits until your team comes back online.' },
    { title: 'They ask about pricing, then disappear.', text: 'The conversation ends without a next step.' },
    { title: 'Several inquiries arrive at once.', text: 'Between messages and daily tasks, some opportunities get missed.' },
    { title: 'They are not ready yet.', text: 'Someone who needs more time also needs a conversation that continues.' },
  ],
  steps: [
    { title: 'We learn about your business', text: 'We review your services, common questions and sales process.' },
    { title: 'We build your agent', text: 'We define how it responds, the information it uses and when it hands over to your team.' },
    { title: 'We set up follow-up', text: 'We configure the messages, calendar and actions your process needs.' },
    { title: 'We put it to work', text: 'We connect WhatsApp, test conversations and make adjustments before launch.' },
  ],
  comparison: [
    { label: '24/7 support', ai: 'Yes, configured', traditional: 'During working hours' },
    { label: 'First reply', ai: 'Immediate', traditional: 'Based on availability' },
    { label: 'Concurrent conversations', ai: 'Several at once', traditional: 'Limited capacity' },
    { label: 'Follow-up', ai: 'Automatic', traditional: 'Manual' },
    { label: 'Lead nurturing', ai: 'Automatic', traditional: 'Manual' },
    { label: 'Qualification', ai: 'Based on defined criteria', traditional: 'Manual' },
    { label: 'Appointments', ai: 'With connected calendar', traditional: 'Manual' },
    { label: 'Process consistency', ai: 'Follows agreed rules', traditional: 'May vary' },
    { label: 'Time off and absences', ai: 'Not applicable', traditional: 'Requires coverage' },
    { label: 'Employment obligations', ai: 'Not applicable', traditional: 'Apply to the role' },
    { label: 'Cases that need judgment', ai: 'Hands over to a person', traditional: 'Direct support' },
  ],
  faqs: [
    {
      q: 'Is it a chatbot?',
      a: 'It is an AI agent: it can interpret questions, consult your business information and respond to the context of a conversation, instead of relying only on a menu of fixed replies.',
    },
    {
      q: 'Can it follow up?',
      a: 'Yes. We configure messages and timing to resume conversations, support prospects who are not ready yet or reactivate opportunities based on your sales process.',
    },
    {
      q: 'Can it book appointments?',
      a: 'Yes. It can connect to a calendar and book based on availability and the rules we define during implementation.',
    },
    {
      q: 'Does it work for any business?',
      a: 'It works particularly well for businesses that regularly receive inquiries, leads or quote requests. We review your process to determine what to automate and what your team should handle.',
    },
    {
      q: 'Do I need to change my WhatsApp number?',
      a: 'It depends on your current account setup. Our team reviews your number and connection options during implementation.',
    },
  ],
  planFeatures: [
    '1 AI agent',
    'WhatsApp',
    'CRM',
    'Automatic replies',
    'Knowledge base',
    'Up to 1,000 AI replies per month',
    'Basic technical support',
  ],
  meta: {
    title: 'AI Agents for WhatsApp from US$120/month | Cluster Media',
    description: 'Reply, qualify and follow up with prospects using an AI agent for WhatsApp. From US$120 per month. Custom implementation by Cluster Media.',
  },
};

export function getAgentContent(locale: string): AgentContent {
  return locale === 'en' ? en : es;
}
