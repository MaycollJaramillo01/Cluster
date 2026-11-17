import { NextResponse } from 'next/server';
import { crm } from '@/lib/crm/db';
import { readUnsubscribeToken } from '@/lib/crm/campaigns';

export const runtime = 'nodejs';

function page(title: string, body: string) {
  return new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>` +
      `<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5">${body}</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

// GET muestra un botón: los antivirus de correo abren los enlaces y no deben dar de baja a nadie.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('t') || '';
  const email = readUnsubscribeToken(token);
  if (!email) return page('Enlace inválido', '<h1>Enlace inválido</h1><p>Este enlace de baja no es válido.</p>');
  return page(
    'Darse de baja',
    `<h1>Darse de baja</h1><p>Dejar de recibir correos de Cluster en <strong>${escape(email)}</strong>.</p>` +
      `<form method="post"><input type="hidden" name="t" value="${escape(token)}"><button type="submit" style="padding:.6rem 1.2rem">Confirmar baja</button></form>`,
  );
}

// POST: el botón de la página y el "un clic" de Gmail/Yahoo (List-Unsubscribe-Post).
export async function POST(request: Request) {
  let token = new URL(request.url).searchParams.get('t') || '';
  if (!token) {
    const form = await request.formData().catch(() => null);
    token = String(form?.get('t') || '');
  }
  const email = readUnsubscribeToken(token);
  if (!email) return page('Enlace inválido', '<h1>Enlace inválido</h1>');
  const sql = await crm();
  await sql`UPDATE subscribers SET status = 'unsubscribed' WHERE email = ${email}`;
  await sql`DELETE FROM campaign_sends WHERE recipient = ${email} AND status = 'pendiente'`;
  return page('Listo', '<h1>Listo</h1><p>Ya no vas a recibir más correos de campañas.</p>');
}
