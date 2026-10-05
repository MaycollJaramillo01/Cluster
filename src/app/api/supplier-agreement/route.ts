import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';
import { site } from '@/lib/site';
import {
  TOKEN_TTL_DAYS,
  agreementHash,
  agreementText,
  openResponse,
  parseSubmission,
  sealResponse,
  supplierAgreement,
  type AgreementResponse,
} from '@/lib/supplier-agreement';

export const runtime = 'nodejs';

type AgreementRecord = AgreementResponse & {
  id: string;
  confirmedAt: string;
  confirmIp: string;
  confirmUserAgent: string;
};

function requestMeta(request: Request) {
  return {
    ip: (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim().slice(0, 60),
    userAgent: (request.headers.get('user-agent') ?? '').slice(0, 200),
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'America/Tegucigalpa',
  }).format(new Date(iso));
}

// CONTACT_FROM_EMAIL lo comparten otros formularios con su propio nombre
// visible: aquí se usa solo su dirección, a nombre de Cluster Media.
function sender() {
  const from = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
  return `${site.name} <${from.match(/<([^>]+)>/)?.[1] ?? from}>`;
}

async function sendEmail(message: {
  to: string[];
  cc?: string[];
  subject: string;
  text: string;
  html?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') throw new Error('resend_not_configured');
    console.info(
      '[supplier-agreement] correo (sin RESEND_API_KEY):',
      message.to,
      message.cc ?? [],
      message.subject,
      `\n${message.text}`,
    );
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender(),
      reply_to: site.email,
      ...message,
    }),
  });

  if (!response.ok) throw new Error(`resend_failed: ${await response.text()}`);
}

function blobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ||
    ''
  ).trim();
}

function recordPath(id: string) {
  return `supplier-agreements/${id}.json`;
}

async function alreadyConfirmed(id: string) {
  const token = blobToken();
  if (!token) return false;

  try {
    const { blobs } = await list({ token, prefix: recordPath(id), limit: 1 });
    return blobs.length > 0;
  } catch (error) {
    console.error('[supplier-agreement] blob lookup error:', error);
    return false;
  }
}

async function saveRecord(record: AgreementRecord) {
  const token = blobToken();
  if (!token) return;

  try {
    await put(recordPath(record.id), JSON.stringify(record, null, 2), {
      token,
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
    });
  } catch (error) {
    console.error('[supplier-agreement] blob storage error:', error);
  }
}

function buildRecordEmail(record: AgreementRecord) {
  const accepted = record.decision === 'si';
  const summary = [
    `Constancia de respuesta al ${supplierAgreement.title} de ${site.name}.`,
    'La respuesta se envió desde el formulario del acuerdo y se confirmó desde el correo electrónico de quien responde (doble confirmación).',
    '',
    `Nombre completo: ${record.fullName}`,
    `Número de identidad: ${record.idNumber}`,
    `Correo electrónico: ${record.email}`,
    `Teléfono: ${record.phone}`,
    ...(record.supplier ? [`Proveedor: ${record.supplier}`] : []),
    `Respuesta: ${accepted ? 'Sí, acepto' : 'No acepto'}`,
    '',
    `Formulario enviado: ${formatDate(record.submittedAt)}`,
    `  ${record.submittedAt} | IP ${record.submitIp || 'no disponible'} | ${record.submitUserAgent || 'navegador no disponible'}`,
    `Correo confirmado: ${formatDate(record.confirmedAt)}`,
    `  ${record.confirmedAt} | IP ${record.confirmIp || 'no disponible'} | ${record.confirmUserAgent || 'navegador no disponible'}`,
    `Folio: ${record.id}`,
    `Huella SHA-256 del texto del acuerdo: ${record.textHash}`,
  ].join('\n');

  return {
    subject: `Acuerdo de proveedores | ${accepted ? 'Sí' : 'No'} | ${record.fullName}`,
    summary,
    text: [summary, '', '-'.repeat(50), '', agreementText()].join('\n'),
  };
}

// GHL antepone el país de la cuenta (+1) a los teléfonos sin código de país: un
// número hondureño de 8 dígitos quedaría guardado como "+1…".
// ponytail: solo reconoce Honduras; otros países sin "+" quedan como los
// interprete GHL. Pedir el país en el formulario si hace falta más.
function ghlPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return `+${digits}`;
  if (digits.length === 8) return `+504${digits}`;
  if (digits.length === 11 && digits.startsWith('504')) return `+${digits}`;
  return phone;
}

// Mismo patrón que los scripts de la cuenta de GHL: upsert del contacto y una
// nota con lo que no tiene campo propio (identidad, respuesta, folio).
async function sendToGhl(record: AgreementRecord, note: string) {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) return;

  async function ghl(method: 'POST' | 'PUT' | 'DELETE', path: string, body: object) {
    const response = await fetch(`https://services.leadconnectorhq.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  try {
    const contact = { locationId, name: record.fullName, email: record.email };
    // Si GHL rechazara el teléfono se reintenta sin él: el contacto no se
    // pierde y el teléfono tal como se escribió queda en la nota.
    const result = await ghl('POST', '/contacts/upsert', {
      ...contact,
      phone: ghlPhone(record.phone),
    }).catch(() => ghl('POST', '/contacts/upsert', contact));
    const path = `/contacts/${result.contact.id}`;

    // Los contactos nuevos entran con "No molestar": la cuenta tiene workflows
    // de ventas que escriben y llaman a los contactos, y un proveedor no es un lead.
    // ponytail: se activa justo después de crear; si un workflow disparara al
    // instante de crearse el contacto, hay que crearlo ya con dnd.
    if (result.new) await ghl('PUT', path, { dnd: true });

    // Etiquetas por separado: enviarlas en el upsert reemplazaría las que ya
    // tenga un contacto existente.
    const accepted = record.decision === 'si';
    await ghl('POST', `${path}/tags`, {
      tags: ['proveedor', `acuerdo-proveedores-${accepted ? 'aceptado' : 'no-aceptado'}`],
    });
    await ghl('DELETE', `${path}/tags`, {
      tags: [`acuerdo-proveedores-${accepted ? 'no-aceptado' : 'aceptado'}`],
    });
    await ghl('POST', `${path}/notes`, { body: note });
  } catch (error) {
    console.error('[supplier-agreement] GHL error:', error);
  }
}

// Paso 1: valida los datos y envía el enlace de confirmación al correo indicado.
// No se registra nada hasta que la persona confirme desde ese correo.
export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const fields = parseSubmission(input);
  if ('error' in fields) {
    return NextResponse.json({ ok: false, error: fields.error }, { status: 400 });
  }

  try {
    const meta = requestMeta(request);
    const token = sealResponse({
      ...fields,
      submittedAt: new Date().toISOString(),
      submitIp: meta.ip,
      submitUserAgent: meta.userAgent,
      textHash: agreementHash(),
    });
    // Host de la solicitud en lugar de site.url: el enlace debe abrir en el
    // mismo dominio (o preview) donde la persona llenó el formulario.
    const url = `${new URL(request.url).origin}/acuerdo-proveedores?confirmar=${token}`;
    // Sin datos escritos por el usuario: este correo sale antes de verificar
    // que la dirección pertenece a quien llenó el formulario.
    const lines = [
      'Hola,',
      `Recibimos una respuesta al “${supplierAgreement.title}” de ${site.name} con este correo electrónico.`,
      `Para que quede registrada, confírmala en este enlace (válido por ${TOKEN_TTL_DAYS} días):`,
      url,
      'Si no fuiste tú, ignora este mensaje: sin confirmación no se registra ninguna respuesta.',
      site.name,
    ];

    await sendEmail({
      to: [fields.email],
      subject: `Confirma tu respuesta al acuerdo de proveedores de ${site.name}`,
      text: lines.join('\n\n'),
      html: lines
        .map((line) =>
          line === url ? `<p><a href="${url}">Confirmar mi respuesta</a></p>` : `<p>${line}</p>`,
        )
        .join(''),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[supplier-agreement] confirmation email error:', error);
    return NextResponse.json({ ok: false, error: 'email_failed' }, { status: 502 });
  }
}

// Paso 2: la persona confirma desde el enlace recibido. Recién aquí se envía la
// constancia con el acuerdo al proveedor y a la empresa, se guarda el registro
// y los datos pasan a GHL.
export async function PUT(request: Request) {
  const input = await request.json().catch(() => null);
  const token = typeof input?.token === 'string' ? input.token : '';
  const response = openResponse(token);
  if (!response) {
    return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 400 });
  }

  const id = createHash('sha256').update(token).digest('hex').slice(0, 32);
  // ponytail: sin bloqueo entre esta consulta y el guardado; dos confirmaciones
  // simultáneas enviarían la constancia dos veces (el botón se desactiva al
  // enviar). Sin Blob configurado tampoco hay registro ni deduplicación.
  if (await alreadyConfirmed(id)) {
    return NextResponse.json({ ok: true, already: true });
  }

  const meta = requestMeta(request);
  const record: AgreementRecord = {
    id,
    ...response,
    confirmedAt: new Date().toISOString(),
    confirmIp: meta.ip,
    confirmUserAgent: meta.userAgent,
  };
  const email = buildRecordEmail(record);

  try {
    await sendEmail({
      to: [record.email],
      cc: record.email === site.email ? undefined : [site.email],
      subject: email.subject,
      text: email.text,
    });
  } catch (error) {
    console.error('[supplier-agreement] record email error:', error);
    return NextResponse.json({ ok: false, error: 'email_failed' }, { status: 502 });
  }

  await saveRecord(record);
  await sendToGhl(record, email.summary);

  const webhook =
    process.env.SUPPLIER_AGREEMENT_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const webhookResponse = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'cluster-supplier-agreement',
          to: site.email,
          subject: email.subject,
          body: email.text,
          ...record,
        }),
      });
      if (!webhookResponse.ok) throw new Error(`webhook_failed: ${webhookResponse.status}`);
    } catch (error) {
      console.error('[supplier-agreement] webhook error:', error);
    }
  }

  return NextResponse.json({ ok: true });
}
