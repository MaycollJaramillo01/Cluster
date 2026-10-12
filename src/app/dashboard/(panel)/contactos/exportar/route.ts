import { NextResponse } from 'next/server';
import { dashboardUnlocked } from '@/lib/crm/access';
import { listContacts } from '@/lib/crm/queries';

function cell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!(await dashboardUnlocked())) return new NextResponse('No autorizado', { status: 401 });
  let contacts;
  try {
    contacts = await listContacts({});
  } catch {
    return NextResponse.json({ error: 'Sin base de datos' }, { status: 503 });
  }
  const lines = [
    'nombre,email,telefono,pais,membresia,etiquetas',
    ...contacts.map((contact) =>
      [contact.name, contact.email, contact.phone || '', contact.country || '', contact.membership || '', contact.tags.join('|')]
        .map(cell)
        .join(','),
    ),
  ];
  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="contactos-cluster.csv"',
    },
  });
}
