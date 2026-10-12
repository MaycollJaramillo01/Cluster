import Link from 'next/link';
import { createPost, moderatePost } from '@/lib/crm/actions';
import { formatDateTime } from '@/lib/crm/format';
import { listCircles, listPosts } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

const tabs = [
  { href: '/dashboard/comunidad/moderacion', label: 'Todos', kind: '', status: '' },
  { href: '/dashboard/comunidad/moderacion?estado=pendiente', label: 'En espera', kind: '', status: 'pendiente' },
  { href: '/dashboard/comunidad/moderacion?tipo=blog', label: 'Blog', kind: 'blog', status: '' },
  { href: '/dashboard/comunidad/moderacion?tipo=muro', label: 'Muro', kind: 'muro', status: '' },
  { href: '/dashboard/comunidad/moderacion?tipo=resena', label: 'Reseñas', kind: 'resena', status: '' },
  { href: '/dashboard/comunidad/moderacion?tipo=video', label: 'Video', kind: 'video', status: '' },
];

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const [posts, circles] = await Promise.all([
    listPosts({ kind: params.tipo, status: params.estado }),
    listCircles(),
  ]);

  return (
    <div className="space-y-6">
      <PageTitle title="Moderación" />
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = (params.tipo || '') === tab.kind && (params.estado || '') === tab.status;
          return (
            <Link key={tab.href} href={tab.href} className={`px-3 py-2 text-sm ${active ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>
              {tab.label}
            </Link>
          );
        })}
      </div>
      <form action={createPost} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-4">
        <Field label="Autor"><input className={fieldClass} name="author" required /></Field>
        <Field label="Tipo">
          <select className={fieldClass} name="kind" defaultValue="muro">
            <option value="muro">Muro</option>
            <option value="blog">Blog</option>
            <option value="resena">Reseña</option>
            <option value="video">Video</option>
            <option value="widget">Widget</option>
          </select>
        </Field>
        <Field label="Círculo">
          <select className={fieldClass} name="circle_id">
            <option value="">General</option>
            {circles.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}</option>)}
          </select>
        </Field>
        <Field label="Mensaje"><input className={fieldClass} name="body" required /></Field>
        <button className={btn} type="submit">Enviar a revisión</button>
      </form>
      {posts.length === 0 ? <Empty title="Sin mensajes" /> : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="border border-black/10 bg-white p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">
                {post.kind} · {post.status} · {formatDateTime(post.created_at)}
              </p>
              <p className="mt-2 text-sm font-medium">{post.author}</p>
              <p className="mt-1 text-sm text-black/70">{post.body}</p>
              <div className="mt-3 flex gap-2">
                <form action={moderatePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="status" value="publicado" />
                  <button className={btnTiny} type="submit">Publicar</button>
                </form>
                <form action={moderatePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="status" value="rechazado" />
                  <button className={btnTiny} type="submit">Rechazar</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
