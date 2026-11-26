import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { VStack } from '@astryxdesign/core/VStack';
import { leaveAcademia } from '@/lib/valux/actions';

const links = [
  ['/academia/perfil', 'Mi perfil'],
  ['/academia/mis-cursos', 'Mis cursos'],
  ['/academia/constancias', 'Mis constancias'],
  ['/academia/recibos', 'Mis recibos'],
  ['/academia/suscripcion', 'Membresía'],
] as const;

// Navegación del área de cuenta: columna en escritorio; en móvil las opciones pasan a otra línea, ninguna queda oculta.
export function AccountNav({ current }: { current: (typeof links)[number][0] }) {
  return (
    <VStack as="nav" aria-label="Mi cuenta" gap={1} className="academy-panel min-w-0 flex-row flex-wrap p-1.5 lg:flex-col lg:flex-nowrap lg:p-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} aria-current={href === current ? 'page' : undefined} className="academy-nav academy-focus shrink-0 whitespace-nowrap lg:w-full">{label}</Link>
      ))}
      <form action={leaveAcademia} className="hidden border-t border-academy-line pt-1 lg:block">
        <Button type="submit" variant="ghost" label="Salir" width="100%" className="justify-start" />
      </form>
    </VStack>
  );
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
}
