// Roles del panel. Sin dependencias de Node: lo usa también el middleware.

export type StaffRole = 'superadmin' | 'contenido' | 'finanzas' | 'profesor';
export type Area = 'crm' | 'contenido' | 'finanzas' | 'profesor';

export const STAFF_ROLES: { id: StaffRole; label: string; detail: string }[] = [
  { id: 'superadmin', label: 'Superadmin', detail: 'Todo el panel, el equipo y los ajustes.' },
  { id: 'contenido', label: 'Admin de contenido', detail: 'Cursos, lecciones, misiones, marketplace, blog, revisiones y personas.' },
  { id: 'finanzas', label: 'Finanzas', detail: 'Ventas, transferencias, reembolsos, membresías, liquidaciones y comisión.' },
  { id: 'profesor', label: 'Profesor', detail: 'Solo sus cursos, sus alumnos y sus ventas.' },
];

export function isStaffRole(value: string): value is StaffRole {
  return STAFF_ROLES.some((role) => role.id === value);
}

// El superadmin entra a todo; los demás solo a su área.
export function canDo(role: StaffRole, area: Area) {
  return role === 'superadmin' || role === area;
}

const FINANCE = [
  '/dashboard/cursos/ventas',
  '/dashboard/cursos/transferencias',
  '/dashboard/cursos/clientes',
  '/dashboard/cursos/suscripcion',
  '/dashboard/cursos/liquidaciones',
  '/dashboard/cursos/donaciones',
  '/dashboard/cursos/ajustes',
  '/dashboard/comprobante',
];

function under(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

// null: ruta libre (entrar, segundo factor).
export function areaForPath(pathname: string): Area | null {
  if (under(pathname, '/dashboard/login') || under(pathname, '/dashboard/auth')) return null;
  if (under(pathname, '/dashboard/profesor')) return 'profesor';
  if (FINANCE.some((base) => under(pathname, base))) return 'finanzas';
  if (under(pathname, '/dashboard/cursos')) return 'contenido';
  return 'crm';
}

export function homeFor(role: StaffRole) {
  if (role === 'contenido') return '/dashboard/cursos';
  if (role === 'finanzas') return '/dashboard/cursos/ventas';
  if (role === 'profesor') return '/dashboard/profesor';
  return '/dashboard';
}
