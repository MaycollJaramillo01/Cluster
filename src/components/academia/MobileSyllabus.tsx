'use client';

import { useId, type ReactNode } from 'react';
import { HStack } from '@astryxdesign/core/HStack';
import { Icon } from '@/components/ui/Icon';

export function MobileSyllabus({ children }: { children: ReactNode }) {
  const id = useId();
  return (
    <>
      <button type="button" popoverTarget={id} className="academy-action academy-action-secondary lg:hidden">
        Temario <Icon name="chevron-down" size={16} aria-hidden="true" />
      </button>
      <aside popover="auto" id={id} aria-label="Temario de la clase" className="academy-popover academy-syllabus-popover border-t border-academy-line bg-academy-surface lg:hidden">
        <HStack as="header" justify="end" className="border-b border-academy-line px-4 py-2">
          <button type="button" popoverTarget={id} popoverTargetAction="hide" className="academy-nav academy-focus">
            <Icon name="close" size={16} /> Cerrar temario
          </button>
        </HStack>
        {children}
      </aside>
    </>
  );
}
