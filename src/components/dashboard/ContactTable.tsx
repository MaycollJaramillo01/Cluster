'use client';

import Link from 'next/link';
import { useState } from 'react';
import { tagContacts } from '@/lib/crm/actions';
import { Mark, btn, fieldClass } from './ui';

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string;
  when: string;
};

export function ContactTable({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const all = rows.length > 0 && selected.length === rows.length;

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="border border-black/10 bg-white">
      <form action={tagContacts} className="flex flex-wrap items-center gap-2 border-b border-black/10 px-4 py-3">
        <input type="hidden" name="ids" value={selected.join(',')} />
        <input className={`${fieldClass} max-w-xs`} name="tag" placeholder="Etiqueta" aria-label="Etiqueta" />
        <button className={btn} type="submit" disabled={selected.length === 0}>
          Etiquetar {selected.length > 0 ? selected.length : ''}
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={all}
                  aria-label="Seleccionar todos"
                  onChange={() => setSelected(all ? [] : rows.map((row) => row.id))}
                />
              </th>
              {['Nombre', 'E-mail', 'Teléfono', 'Etiquetas'].map((item) => (
                <th key={item} className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-black/45">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    aria-label={`Seleccionar ${row.name}`}
                    onChange={() => toggle(row.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/contactos/${row.id}`} className="flex items-center gap-3 font-medium hover:text-brand">
                    <Mark name={row.name} />
                    <span>
                      {row.name}
                      <span className="mt-0.5 block font-normal text-xs text-black/40">{row.when}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-black/70">{row.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.phone || '—'}</td>
                <td className="px-4 py-3 text-black/60">{row.tags || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
