import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto';

type Block = { p: string } | { list: string[] } | { quote: string };

// Fuente única del acuerdo: la página lo muestra y la constancia por correo
// envía exactamente este mismo texto.
export const supplierAgreement: {
  title: string;
  intro: string;
  sections: { id: string; title: string; blocks: Block[] }[];
  acceptance: string;
} = {
  title: 'Acuerdo de buenas prácticas para proveedores externos',
  intro:
    'En Cluster Media trabajamos con proveedores externos como aliados de nuestro equipo. Estos lineamientos buscan establecer una relación clara, profesional y de confianza, protegiendo el trabajo de ambas partes y nuestra relación con los clientes.',
  sections: [
    {
      id: 'supplier-commitment',
      title: 'Nuestro compromiso con usted',
      blocks: [
        { p: 'Al trabajar con Cluster, nos comprometemos a:' },
        {
          list: [
            'Cumplir con los pagos en los tiempos y condiciones acordados.',
            'Comunicar claramente el alcance, horarios y requerimientos de cada producción.',
            'Procurar una buena planificación, respetando su tiempo y disponibilidad.',
            'Informar oportunamente cualquier cambio relevante.',
            'Mantener siempre un trato respetuoso y profesional.',
          ],
        },
      ],
    },
    {
      id: 'represents-cluster',
      title: 'Cuando representa a Cluster',
      blocks: [
        {
          p: 'Cuando participa en una producción, visita o proyecto de Cluster, representa a nuestra marca frente al cliente. Su comportamiento, comunicación y calidad de trabajo forman parte de la experiencia que ofrecemos.',
        },
        {
          p: 'Por ello, cualquier inconformidad, problema interno o diferencia relacionada con Cluster deberá conversarse directamente con nosotros y no con el cliente.',
        },
      ],
    },
    {
      id: 'client-coordination',
      title: 'Coordinación con el cliente',
      blocks: [
        { p: 'La coordinación general y comercial con el cliente corresponde a Cluster.' },
        {
          p: 'Si el cliente solicita una nueva producción, cambio de fecha, contenido adicional u otro servicio, no deberá confirmarlo directamente. La respuesta deberá ser:',
        },
        { quote: '“Permítame confirmarlo con el equipo de programación y le damos respuesta.”' },
        { p: 'Esto nos permite evitar conflictos de agenda, alcance o costos.' },
      ],
    },
    {
      id: 'commercial-relationship',
      title: 'Relación comercial',
      blocks: [
        {
          p: 'Consideramos como motivo de rompimiento de nuestra relación de negocio negociar, cotizar, ofrecer o aceptar directamente servicios de un cliente conocido a través de Cluster.',
        },
        {
          p: 'Asimismo, durante los servicios realizados para Cluster, el proveedor se compromete a:',
        },
        {
          list: [
            'No promocionar su empresa, marca o servicios frente al cliente.',
            'No compartir sus datos personales de ningún tipo (teléfono o email).',
            'No buscar oportunidades de negocio propias o de terceros con el cliente.',
            'No utilizar la relación generada a través de Cluster para ofrecer posteriormente servicios de manera directa.',
          ],
        },
        {
          p: 'Si un cliente se acerca al proveedor con una propuesta comercial directa, esperamos que se comunique a Cluster.',
        },
      ],
    },
    {
      id: 'content-confidentiality',
      title: 'Contenido y confidencialidad',
      blocks: [
        {
          p: 'El material producido para nuestros clientes (fotografías, videos, detrás de cámaras u otro contenido) no deberá publicarse, utilizarse como portafolio ni emplearse para promocionar al proveedor o su marca.',
        },
        {
          p: 'La información sobre clientes, precios, estrategias, procesos internos o proyectos de Cluster deberá manejarse de manera confidencial.',
        },
      ],
    },
    {
      id: 'reciprocity',
      title: 'Reciprocidad',
      blocks: [
        {
          p: 'Cluster se compromete a respetar el trabajo, tiempo y acuerdos con sus proveedores. Esperamos de nuestros proveedores el mismo cuidado hacia nuestra marca, nuestros clientes y nuestras relaciones comerciales.',
        },
      ],
    },
  ],
  acceptance:
    'He leído y comprendo estos lineamientos y acepto trabajar bajo estas buenas prácticas cuando preste servicios para Cluster Media.',
};

export function agreementText() {
  return [
    supplierAgreement.title.toUpperCase(),
    '',
    supplierAgreement.intro,
    ...supplierAgreement.sections.flatMap((section) => [
      '',
      section.title.toUpperCase(),
      ...section.blocks.map((block) =>
        'list' in block
          ? block.list.map((item) => `- ${item}`).join('\n')
          : 'quote' in block
            ? block.quote
            : block.p,
      ),
    ]),
    '',
    'ACEPTACIÓN DEL ACUERDO',
    supplierAgreement.acceptance,
  ].join('\n');
}

export function agreementHash() {
  return createHash('sha256').update(agreementText()).digest('hex');
}

export type AgreementFields = {
  fullName: string;
  idNumber: string;
  email: string;
  phone: string;
  decision: 'si' | 'no';
  supplier: string;
};

export type AgreementResponse = AgreementFields & {
  submittedAt: string;
  submitIp: string;
  submitUserAgent: string;
  textHash: string;
};

function clean(value: unknown, maxLength: number) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function parseSubmission(
  input: Record<string, unknown>,
): AgreementFields | { error: string } {
  const fullName = clean(input.fullName, 120);
  const idNumber = clean(input.idNumber, 40);
  const email = clean(input.email, 254).toLowerCase();
  const phone = clean(input.phone, 25);
  const decision = clean(input.decision, 2);

  if (fullName.length < 3) return { error: 'invalid_full_name' };
  if (idNumber.replace(/[^0-9a-z]/gi, '').length < 5) return { error: 'invalid_id_number' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'invalid_email' };
  if (phone.replace(/\D/g, '').length < 7) return { error: 'invalid_phone' };
  if (decision !== 'si' && decision !== 'no') return { error: 'invalid_decision' };

  return { fullName, idNumber, email, phone, decision, supplier: clean(input.supplier, 80) };
}

export const TOKEN_TTL_DAYS = 7;

function tokenKey() {
  // ponytail: la clave sale de RESEND_API_KEY (sin ella tampoco se puede enviar
  // el correo de confirmación). Rotarla invalida los enlaces aún sin confirmar;
  // usar un secreto dedicado si eso llega a importar.
  const secret =
    process.env.RESEND_API_KEY ||
    (process.env.NODE_ENV === 'production' ? '' : 'supplier-agreement-dev');
  if (!secret) throw new Error('supplier_agreement_secret_missing');
  return createHmac('sha256', secret).update('supplier-agreement-token-v1').digest();
}

// El enlace de confirmación lleva la respuesta cifrada y autenticada
// (AES-256-GCM): no hay datos personales legibles en la URL ni en los logs, y
// no hace falta guardar respuestas sin confirmar.
export function sealResponse(response: AgreementResponse) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', tokenKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(response), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url');
}

export function openResponse(token: string, now = Date.now()): AgreementResponse | null {
  try {
    const raw = Buffer.from(token, 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', tokenKey(), raw.subarray(0, 12), {
      authTagLength: 16,
    });
    decipher.setAuthTag(raw.subarray(12, 28));
    const response = JSON.parse(
      Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8'),
    ) as AgreementResponse;

    const age = now - Date.parse(response.submittedAt);
    if (!(age >= 0 && age <= TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)) return null;
    // Si el texto cambió después del envío, la respuesta ya no corresponde a
    // lo que la persona leyó: debe responder de nuevo.
    if (response.textHash !== agreementHash()) return null;
    return response;
  } catch {
    return null;
  }
}
