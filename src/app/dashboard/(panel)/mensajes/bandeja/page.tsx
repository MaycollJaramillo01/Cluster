import Link from 'next/link';
import { sendMessage } from '@/lib/crm/actions';
import { formatDateTime } from '@/lib/crm/format';
import { getContact, listMessages, listThreads } from '@/lib/crm/queries';
import { Empty, Field, Mark, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ contacto?: string }>;
}) {
  const params = await searchParams;
  const threads = await listThreads();
  const activeId = params.contacto || threads[0]?.id;
  const [contact, messages] = activeId ? await Promise.all([getContact(activeId), listMessages(activeId)]) : [null, []];

  return (
    <div className="space-y-6">
      <PageTitle title="Bandeja" />
      {threads.length === 0 ? <Empty title="Sin conversaciones" /> : (
        <div className="grid min-h-[560px] border border-black/10 bg-white lg:grid-cols-[300px_minmax(0,1fr)]">
          <ul className="border-b border-black/10 lg:border-b-0 lg:border-r">
            {threads.map((thread) => (
              <li key={thread.id}>
                <Link href={`/dashboard/mensajes/bandeja?contacto=${thread.id}`} className={`flex gap-3 border-b border-black/5 px-4 py-3 ${thread.id === activeId ? 'bg-brand/10' : ''}`}>
                  <Mark name={thread.name} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{thread.name}</span>
                    <span className="block truncate text-xs text-black/45">{thread.last_body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {contact ? (
            <div className="flex flex-col">
              <div className="border-b border-black/10 px-5 py-4">
                <p className="font-medium">{contact.name}</p>
                <p className="text-xs text-black/45">{contact.phone || contact.email}</p>
              </div>
              <ul className="flex-1 space-y-3 px-5 py-5">
                {messages.map((message) => (
                  <li key={message.id} className={`max-w-md text-sm ${message.direction === 'out' ? 'ml-auto bg-ink px-3 py-2 text-white' : 'bg-paper px-3 py-2'}`}>
                    <p>{message.body}</p>
                    <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.12em] ${message.direction === 'out' ? 'text-white/50' : 'text-black/40'}`}>
                      {message.channel} · {formatDateTime(message.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
              <form action={sendMessage} className="space-y-2 border-t border-black/10 p-4">
                <input type="hidden" name="contact_id" value={contact.id} />
                <Field label="Canal">
                  <select className={fieldClass} name="channel" defaultValue="whatsapp">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Correo</option>
                  </select>
                </Field>
                <textarea className={fieldClass} name="body" rows={3} required placeholder="Escribe la respuesta" />
                <button className={btn} type="submit">Enviar</button>
              </form>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
