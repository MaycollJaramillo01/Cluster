export async function sendAcademiaMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  const email = to.trim().toLowerCase();
  if (!key || !email.includes('@')) {
    // Sin Resend en local, el correo (con el código de acceso) sale en la terminal del servidor.
    if (process.env.NODE_ENV === 'development') console.info(`[correo a ${email}] ${subject}\n${text}`);
    return;
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'Cluster Media <onboarding@resend.dev>',
        to: email,
        subject,
        text,
      }),
    });
    // Resend responde 4xx sin lanzar error (remitente sin verificar, clave mala): queda en los registros de Vercel.
    if (!response.ok) console.error(`Resend rechazó el correo (${response.status}): ${(await response.text()).slice(0, 300)}`);
  } catch (error) {
    // El acceso ya quedó guardado. El correo no debe deshacer la compra.
    console.error('Resend no respondió:', error);
  }
}
