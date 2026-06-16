'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

export type FaqItem = { q: string; a: string };

export function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 overflow-hidden rounded-3xl bg-white/[0.04]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
            >
              <span className="font-display text-base font-medium text-paper sm:text-lg">
                {item.q}
              </span>
              <span
                className={`flex h-8 w-8 flex-none items-center justify-center bg-white/[0.06] text-brand-300 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 bg-brand/10' : ''
                }`}
              >
                <Icon name="chevron-down" size={18} />
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-[15px] leading-relaxed text-paper/55">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
