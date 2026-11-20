'use client';

import Link from 'next/link';
import { Tab, TabList } from '@astryxdesign/core/TabList';

// Navegación por URL: se puede compartir el acceso docente y funciona con Atrás.
export function AccessTabs({ teacher }: { teacher: boolean }) {
  return (
    <TabList value={teacher ? 'teachers' : 'students'} onChange={() => {}} layout="fill" hasDivider aria-label="Tipo de acceso">
      <Tab value="students" label="Estudiantes" href="/academia/entrar" as={Link} />
      <Tab value="teachers" label="Maestros" href="/academia/entrar?acceso=maestros" as={Link} />
    </TabList>
  );
}
