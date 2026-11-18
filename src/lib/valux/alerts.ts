import { crm } from '@/lib/crm/db';
import { site } from '@/lib/site';
import { sendAcademiaMail } from './mail';

const QUIET_MINUTES = 60;

// Aviso por correo al equipo cuando falla algo que mueve dinero o accesos.
// Como mucho un correo por tema cada hora: un webhook que falla 200 veces no llena la bandeja.
// Destino: ALERT_EMAIL o el correo del sitio.
export async function alertTeam(topic: string, detail: unknown) {
  const text = detail instanceof Error ? `${detail.message}\n\n${detail.stack || ''}` : String(detail);
  console.error(`[alerta] ${topic}:`, text);
  try {
    const sql = await crm();
    const key = `alert:${topic.slice(0, 80)}`;
    const now = new Date();
    const claimed = await sql`
      INSERT INTO crm_meta (key, value) VALUES (${key}, ${now.toISOString()})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        WHERE crm_meta.value < ${new Date(now.getTime() - QUIET_MINUTES * 60_000).toISOString()}
      RETURNING key
    `;
    if (!claimed.length) return false;
    await sendAcademiaMail(
      process.env.ALERT_EMAIL?.trim() || site.email,
      `[Alerta Cluster] ${topic}`,
      [
        `Falló: ${topic}`,
        `Cuándo: ${now.toLocaleString('es-HN', { timeZone: 'America/Tegucigalpa' })}`,
        `Entorno: ${process.env.VERCEL_ENV || process.env.NODE_ENV || 'local'}`,
        '',
        text.slice(0, 4000),
        '',
        `No se manda otro aviso de este tema durante ${QUIET_MINUTES} minutos. Los detalles completos están en los logs de Vercel.`,
      ].join('\n'),
    );
    return true;
  } catch (error) {
    // Si la base tampoco responde, al menos queda en los logs.
    console.error('[alerta] no se pudo avisar:', error);
    return false;
  }
}
