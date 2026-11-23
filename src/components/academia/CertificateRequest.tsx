import { requestCertificate } from '@/lib/valux/certificate-actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

export function CertificateRequest({ slug }: { slug: string }) {
  return <form action={requestCertificate}>
    <input type="hidden" name="course" value={slug} />
    <SubmitButton pending="Comprobando avance…" className="text-sm font-semibold">Obtener constancia</SubmitButton>
  </form>;
}
