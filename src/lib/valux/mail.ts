// El resultado permite reintentar seguimientos sin marcarlos enviados por error.
export async function sendAcademiaMail(to: string, subject: string, text: string, eventKey?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  const email = to.trim().toLowerCase();
  if (!email.includes('@')) return false;
  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[correo a ${email}] ${subject}\n${text}`);
      return true;
    }
    console.error('Correo de academia: falta RESEND_API_KEY');
    return false;
  }
  const body = JSON.stringify({
    from: process.env.CONTACT_FROM_EMAIL?.trim() || 'Cluster Media <onboarding@resend.dev>',
    to: email, subject, text,
  });
  // Web Crypto también funciona cuando instrumentation se compila para Edge.
  const idempotencyKey = eventKey
    ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${eventKey}:${body}`))))
        .map((byte) => byte.toString(16).padStart(2, '0')).join('')
    : crypto.randomUUID();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body,
        signal: AbortSignal.timeout(8_000),
      });
      if (response.ok) return true;
      console.error(`Resend rechazó el correo (${response.status})`);
      if (response.status !== 429 && response.status !== 409 && response.status < 500) return false;
    } catch {
      console.error('Resend no respondió al envío de academia');
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
  return false;
}
