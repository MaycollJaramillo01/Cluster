import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Recibe el lead de la landing de Ruta Local y lo reenvía al webhook de
// GoHighLevel (pipeline "Ruta Local Leads"). Configura la URL del webhook en
// la variable de entorno GHL_RUTA_LOCAL_WEBHOOK_URL. Si no está definida,
// la respuesta sigue siendo 200: el formulario usa WhatsApp como respaldo.
export async function POST(request: Request) {
  let lead: Record<string, unknown>;
  try {
    lead = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const webhook = process.env.GHL_RUTA_LOCAL_WEBHOOK_URL;
  if (!webhook) {
    // Sin webhook configurado: registramos y dejamos que el respaldo opere.
    console.info('[ruta-local] lead recibido (sin webhook GHL):', lead);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'ruta-local-landing', ...lead }),
    });
    return NextResponse.json({ ok: res.ok, forwarded: true });
  } catch (error) {
    console.error('[ruta-local] error reenviando a GHL:', error);
    return NextResponse.json({ ok: false, forwarded: false }, { status: 502 });
  }
}
