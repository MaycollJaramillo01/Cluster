'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { crm } from '@/lib/crm/db';
import { academiaPersonId } from './session';
import { certificatesPath, isCertificateCode, issueCourseCertificate } from './certificates';

export async function requestCertificate(form: FormData) {
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const slug = String(form.get('course') || '');
  if (!slug || slug.length > 160) redirect(certificatesPath);
  const result = await issueCourseCertificate(personId, slug);
  if (result.id) {
    revalidatePath(certificatesPath);
    redirect(`${certificatesPath}/${result.id}`);
  }
  redirect(`/academia/${encodeURIComponent(slug)}?terminado=1&constancia=${result.error}`);
}

export async function setCertificateSharing(form: FormData) {
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const id = String(form.get('id') || '');
  const enabled = form.get('share') === '1';
  if (!isCertificateCode(id)) redirect(certificatesPath);
  const sql = await crm();
  const [row] = await sql`UPDATE lms_course_certificates cert
    SET share_code = CASE WHEN ${enabled}::boolean THEN COALESCE(cert.share_code, ${crypto.randomUUID()}::uuid) ELSE NULL END
    WHERE cert.id = ${id} AND cert.person_id = ${personId}
    RETURNING cert.id`;
  if (!row) redirect(certificatesPath);
  revalidatePath(certificatesPath);
  redirect(`${certificatesPath}/${id}`);
}
