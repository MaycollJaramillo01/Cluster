import type { SidebarCounts } from '@/lib/crm/types';

export type NavItem = {
  href: string;
  label: string;
  count?: number;
  match: 'exact' | 'prefix' | 'contacts-root';
};

export type Section = {
  id: string;
  href: string;
  label: string;
  title: string;
  description: string;
};

export const sections: Section[] = [
  {
    id: 'inicio',
    href: '/dashboard',
    label: 'Inicio',
    title: 'Operación',
    description: 'Contactos, citas, campañas y el valor que se está moviendo.',
  },
  {
    id: 'sitios',
    href: '/dashboard/sitios',
    label: 'Sitios',
    title: 'Sitios y embudos',
    description: 'Páginas que Cluster publica y los embudos que convierten.',
  },
  {
    id: 'editor',
    href: '/dashboard/editor',
    label: 'Editor',
    title: 'Editor',
    description: 'Bloques de una página: orden, texto y botón.',
  },
  {
    id: 'tienda',
    href: '/dashboard/tienda',
    label: 'Tienda',
    title: 'Tienda',
    description: 'Productos, precios y pedidos cobrados.',
  },
  {
    id: 'contactos',
    href: '/dashboard/contactos',
    label: 'Contactos',
    title: 'Contactos',
    description: 'Personas que escriben, compran o agendan con Cluster.',
  },
  {
    id: 'citas',
    href: '/dashboard/citas',
    label: 'Citas',
    title: 'Citas',
    description: 'Eventos, agenda y quién atiende cada reserva.',
  },
  {
    id: 'mensajes',
    href: '/dashboard/mensajes',
    label: 'Mensajes',
    title: 'Mensajes',
    description: 'Campañas, automatizaciones y la bandeja de conversaciones.',
  },
  {
    id: 'comunidad',
    href: '/dashboard/comunidad',
    label: 'Comunidad',
    title: 'Comunidad',
    description: 'Círculos, miembros y lo que hay que moderar.',
  },
  {
    id: 'embudo',
    href: '/dashboard/embudo',
    label: 'Embudo',
    title: 'Embudo',
    description: 'Oportunidades, del primer mensaje al cierre.',
  },
];

export function itemsFor(id: string, counts: SidebarCounts): NavItem[] {
  if (id === 'inicio') {
    return [
      { href: '/dashboard', label: 'Resumen', match: 'exact' },
      { href: '/dashboard/embudo', label: 'Embudo', match: 'prefix' },
      { href: '/dashboard/mensajes/bandeja', label: 'Bandeja', match: 'prefix' },
    ];
  }
  if (id === 'sitios') {
    return [
      { href: '/dashboard/sitios', label: 'Todos', match: 'exact' },
      { href: '/dashboard/sitios?kind=embudo', label: 'Embudos', match: 'exact' },
      { href: '/dashboard/sitios?kind=sitio', label: 'Sitios web', match: 'exact' },
    ];
  }
  if (id === 'editor') {
    return [{ href: '/dashboard/editor', label: 'Páginas', match: 'prefix' }];
  }
  if (id === 'tienda') {
    return [{ href: '/dashboard/tienda', label: 'Catálogo', match: 'prefix' }];
  }
  if (id === 'contactos') {
    return [
      { href: '/dashboard/contactos', label: 'Todos', count: counts.contacts, match: 'contacts-root' },
      { href: '/dashboard/contactos?segment=7', label: 'Creados en 7 días', count: counts.last7, match: 'exact' },
      { href: '/dashboard/contactos?segment=30', label: 'Creados en 30 días', count: counts.last30, match: 'exact' },
      { href: '/dashboard/contactos?membership=all', label: 'Todos los miembros', count: counts.members, match: 'exact' },
      ...counts.memberships.map((item) => ({
        href: `/dashboard/contactos?membership=${encodeURIComponent(item.name)}`,
        label: item.name,
        count: item.count,
        match: 'exact' as const,
      })),
      { href: '/dashboard/contactos/envios', label: 'Envíos de formularios', match: 'prefix' },
      { href: '/dashboard/contactos/ajustes', label: 'Ajustes', match: 'prefix' },
    ];
  }
  if (id === 'citas') {
    return [
      { href: '/dashboard/citas', label: 'Eventos', match: 'exact' },
      { href: '/dashboard/citas/agenda', label: 'Agenda', match: 'prefix' },
      { href: '/dashboard/citas/operadores', label: 'Operadores', match: 'prefix' },
      { href: '/dashboard/citas/servicios', label: 'Servicios', match: 'prefix' },
    ];
  }
  if (id === 'mensajes') {
    return [
      { href: '/dashboard/mensajes', label: 'Panel', match: 'exact' },
      { href: '/dashboard/mensajes/campanas', label: 'Campañas', match: 'prefix' },
      { href: '/dashboard/mensajes/automatizaciones', label: 'Automatizaciones', match: 'prefix' },
      { href: '/dashboard/mensajes/suscriptores', label: 'Suscriptores', count: counts.subscribers, match: 'prefix' },
      { href: '/dashboard/mensajes/sistema', label: 'Correos del sistema', match: 'prefix' },
      { href: '/dashboard/mensajes/plantillas', label: 'Plantillas', match: 'prefix' },
      { href: '/dashboard/mensajes/bandeja', label: 'Bandeja', match: 'prefix' },
      { href: '/dashboard/mensajes/ajustes', label: 'Ajustes', match: 'prefix' },
    ];
  }
  if (id === 'comunidad') {
    return [
      { href: '/dashboard/comunidad', label: 'Empezar', match: 'exact' },
      { href: '/dashboard/comunidad/panel', label: 'Panel', match: 'prefix' },
      { href: '/dashboard/comunidad/circulos', label: 'Círculos', count: counts.circles, match: 'prefix' },
      { href: '/dashboard/comunidad/miembros', label: 'Miembros', count: counts.circleMembers, match: 'prefix' },
      { href: '/dashboard/comunidad/moderacion', label: 'Moderación', count: counts.posts, match: 'prefix' },
      { href: '/dashboard/comunidad/ajustes', label: 'Ajustes', match: 'prefix' },
    ];
  }
  return [
    { href: '/dashboard/embudo', label: 'Tablero', match: 'exact' },
    { href: '/dashboard/embudo?stage=nuevo', label: 'Nuevos', match: 'exact' },
    { href: '/dashboard/embudo?stage=calificado', label: 'Calificados', match: 'exact' },
    { href: '/dashboard/embudo?stage=propuesta', label: 'Propuesta', match: 'exact' },
    { href: '/dashboard/embudo?stage=ganado', label: 'Ganados', match: 'exact' },
    { href: '/dashboard/embudo?stage=perdido', label: 'Perdidos', match: 'exact' },
  ];
}

export function sectionFor(pathname: string) {
  const match = sections.find((section) =>
    section.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === section.href || pathname.startsWith(`${section.href}/`),
  );
  return match ?? sections[0];
}
