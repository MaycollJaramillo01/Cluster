import { crm } from '@/lib/crm/db';

// Eventos del embudo y del aprendizaje (lead_created, checkout_started, purchase_completed...).
// Un id fijo deduplica: el mismo evento repetido por un reintento o un webhook se guarda una vez.
export async function trackEvent(
  name: string,
  input: { id?: string; personId?: string | null; email?: string | null; data?: Record<string, unknown> } = {},
) {
  try {
    const sql = await crm();
    await sql`
      INSERT INTO academia_events (id, name, person_id, email, data)
      VALUES (
        ${input.id || crypto.randomUUID()}, ${name}, ${input.personId || null},
        ${input.email ? input.email.trim().toLowerCase() : null}, ${input.data ? JSON.stringify(input.data) : null}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  } catch (error) {
    // La analítica nunca tumba un cobro ni una clase.
    console.error('[academia] evento:', name, error);
  }
}

export const STAGES = ['nuevo', 'interesado', 'checkout', 'comprador', 'miembro', 'inactivo'] as const;
export type Stage = (typeof STAGES)[number];

// La etapa solo avanza (nuevo → interesado → checkout → comprador → miembro).
// inactivo la pone el cierre nocturno y cualquier avance la saca de ahí.
export async function advanceStage(target: { personId?: string | null; email?: string | null }, stage: Exclude<Stage, 'inactivo'>) {
  const rank = STAGES.indexOf(stage);
  const sql = await crm();
  await sql`
    UPDATE valux_people SET stage = ${stage}
    WHERE (id = ${target.personId || ''} OR email = ${(target.email || '').trim().toLowerCase()})
      AND (stage = 'inactivo' OR array_position(${STAGES as unknown as string[]}::text[], stage) < ${rank + 1})
  `;
}

export type Lead = { source: string; utm: string; consentEmail: boolean; consentWhatsapp: boolean };

// Se guarda una sola vez: la primera fuente es la que trajo a la persona.
export async function saveLead(personId: string, lead: Lead) {
  const sql = await crm();
  await sql`
    UPDATE valux_people
    SET source = COALESCE(source, ${lead.source || null}),
      utm = COALESCE(utm, ${lead.utm || null}),
      consent_email = ${lead.consentEmail},
      consent_whatsapp = ${lead.consentWhatsapp},
      consent_at = now()
    WHERE id = ${personId}
  `;
}
