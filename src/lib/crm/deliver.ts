export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function smsConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID?.trim() && process.env.TWILIO_AUTH_TOKEN?.trim() && process.env.TWILIO_FROM?.trim());
}

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN?.trim() && process.env.WHATSAPP_PHONE_ID?.trim());
}

function digits(phone: string) {
  return phone.replace(/\D/g, '');
}

export async function deliverEmail(
  to: string,
  subject: string,
  text: string,
  attachment?: { filename: string; content: string },
) {
  const key = process.env.RESEND_API_KEY?.trim();
  const email = to.trim().toLowerCase();
  if (!key || !email.includes('@')) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'Cluster Media <onboarding@resend.dev>',
        to: email,
        subject,
        text,
        attachments: attachment
          ? [{ filename: attachment.filename, content: Buffer.from(attachment.content).toString('base64') }]
          : undefined,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deliverSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM?.trim();
  const phone = digits(to);
  if (!sid || !token || !from || phone.length < 8) return false;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: `+${phone}`, From: from, Body: body.slice(0, 1000) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deliverWhatsapp(to: string, body: string) {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_ID?.trim();
  const phone = digits(to);
  if (!token || !phoneId || phone.length < 8) return false;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: body.slice(0, 4000) },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
