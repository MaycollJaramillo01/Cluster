'use client';

import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@/components/ui/Icon';

export function CatalogControls({ q, category, price, order, duration, format, topics, total }: {
  q: string; category: string; price: string; order: string; duration: string; format: string;
  topics: { id: string; label: string; count: number }[]; total: number;
}) {
  const href = (changes: Record<string, string>) => {
    const params = new URLSearchParams({ vista: 'catalogo', q, categoria: category, tipo: price, orden: order, duracion: duration, formato: format, ...changes });
    for (const [key, value] of [...params]) if (!value) params.delete(key);
    return `/academia?${params}#catalogo`;
  };
  return (
    <form action="/academia#catalogo" role="search" aria-label="Buscar y filtrar cursos" className="space-y-4" onChange={(event) => {
      if (event.target instanceof HTMLSelectElement) event.currentTarget.requestSubmit();
    }}>
      <input type="hidden" name="vista" value="catalogo" />
      <input type="hidden" name="formato" value={format} />
      <HStack gap={3} align="center" wrap="wrap">
        <HStack gap={2} align="center" className="min-w-0 flex-1 basis-full rounded-academy border border-academy-line bg-academy-page p-2 lg:basis-80">
          <Icon name="search" size={20} className="ml-1 shrink-0 text-academy-primary" aria-hidden="true" />
          <label htmlFor="course-search" className="sr-only">Buscar cursos</label>
          <input id="course-search" type="search" name="q" defaultValue={q} autoComplete="off" placeholder="Buscar por curso, habilidad o herramienta…" className="min-h-10 min-w-0 flex-1 scroll-mt-24 bg-transparent px-1 text-sm text-academy-ink placeholder:text-academy-muted" />
          <Button type="submit" variant="primary" label="Buscar" size="sm" />
        </HStack>
        <label className="flex min-h-12 items-center gap-2 rounded-academy border border-academy-line bg-academy-page px-3 text-sm font-medium">
          <Text className="sr-only">Ordenar cursos</Text>
          <select name="orden" defaultValue={order} className="min-h-11 max-w-full bg-transparent text-sm">
            <option value="relevancia">Más relevantes</option><option value="precio-asc">Precio: menor a mayor</option><option value="precio-desc">Precio: mayor a menor</option><option value="nombre">Nombre: A–Z</option>
          </select>
        </label>
        <nav aria-label="Vista del catálogo" className="flex rounded-academy border border-academy-line p-1">
          <Link href={href({ formato: 'cuadricula' })} aria-label="Vista de cuadrícula" aria-current={format !== 'lista' ? 'page' : undefined} className={`academy-focus rounded-academy px-3 py-2 ${format !== 'lista' ? 'bg-academy-tint text-academy-primary' : 'text-academy-muted'}`}><Icon name="grid" size={18} /></Link>
          <Link href={href({ formato: 'lista' })} aria-label="Vista de lista" aria-current={format === 'lista' ? 'page' : undefined} className={`academy-focus rounded-academy px-3 py-2 ${format === 'lista' ? 'bg-academy-tint text-academy-primary' : 'text-academy-muted'}`}><Icon name="menu" size={18} /></Link>
        </nav>
        <Link href="/academia?vista=catalogo#catalogo" className="academy-nav academy-focus text-sm">Limpiar filtros</Link>
      </HStack>
      <HStack gap={3} align="center" wrap="wrap">
        <Text className="text-xs font-bold text-academy-ink">Filtros</Text>
        <label className="flex items-center gap-2 rounded-academy bg-academy-page px-3 text-xs font-medium">Categoría
          <select aria-label="Categoría" name="categoria" defaultValue={category} className="min-h-10 max-w-full bg-transparent text-xs"><option value="">Todas</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}</select>
        </label>
        <label className="flex items-center gap-2 rounded-academy bg-academy-page px-3 text-xs font-medium">Precio
          <select aria-label="Precio" name="tipo" defaultValue={price} className="min-h-10 bg-transparent text-xs"><option value="">Todos</option><option value="gratis">Gratis</option><option value="pago">De pago</option></select>
        </label>
        <label className="flex items-center gap-2 rounded-academy bg-academy-page px-3 text-xs font-medium">Duración
          <select aria-label="Duración" name="duracion" defaultValue={duration} className="min-h-10 bg-transparent text-xs"><option value="">Todas</option><option value="corta">Hasta 2 horas</option><option value="larga">Más de 2 horas</option></select>
        </label>
        <nav aria-label="Filtrar por tema" className="flex min-w-0 flex-wrap gap-2">
          {[{ id: '', label: 'Todos', count: total }, ...topics].map((topic) => <Link key={topic.id} href={href({ categoria: topic.id })} aria-current={category === topic.id ? 'page' : undefined} className={`academy-focus rounded-academy-full px-3 py-2 text-xs font-medium ${category === topic.id ? 'bg-academy-action text-academy-action-text' : 'bg-academy-page text-academy-muted hover:text-academy-primary'}`}>{topic.label} ({topic.count})</Link>)}
        </nav>
      </HStack>
    </form>
  );
}
