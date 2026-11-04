export async function sendAcademiaMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  const email = to.trim().toLowerCase();
  if (!key || !email.includes('@')) return;
  try {
    await fetch('https://api.resend.com/emails', {
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
  } catch {
    // El acceso ya quedó guardado. El correo no debe deshacer la compra.
  }
}
