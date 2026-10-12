import { saveCommunitySettings } from '@/lib/crm/actions';
import { getCommunitySettings } from '@/lib/crm/queries';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function CommunitySettingsPage() {
  const settings = await getCommunitySettings();

  return (
    <div className="space-y-6">
      <PageTitle title="Ajustes" />
      <form action={saveCommunitySettings} className="max-w-xl space-y-3 border border-black/10 bg-white p-5">
        <h2 className="font-display text-3xl tracking-wide">Ruta de la comunidad</h2>
        <p className="text-sm text-black/55">La dirección queda como dominio.com/{settings.url_slug || 'community'}/nombre-del-circulo.</p>
        <Field label="Slug">
          <input className={fieldClass} name="url_slug" defaultValue={settings.url_slug} />
        </Field>
        <button className={btn} type="submit">Guardar</button>
      </form>
    </div>
  );
}
