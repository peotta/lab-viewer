import { useEffect, useState } from 'react';
import { goTo } from './MarkdownView';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TocState {
  items: TocItem[];
  done: string[];
}

/** Índice do roteiro aberto: títulos de nível 2 e 3 e os passos, com o trecho em leitura destacado. */
export function Toc({ items, done }: TocState) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!items.length) return;
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  if (!items.length) return null;
  return (
    <nav aria-label="Nesta página" className="text-[0.92rem]">
      <p className="mb-2 font-bold">Nesta página</p>
      <ul className="space-y-0.5">
        {items.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 0.85}rem` }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                goTo(h.id);
              }}
              aria-current={active === h.id ? 'location' : undefined}
              className={`block rounded px-1.5 py-0.5 hover:bg-surface2 ${active === h.id ? 'bg-surface2 font-bold text-accent' : ''} ${h.level === 2 ? 'font-semibold' : 'text-muted'}`}
            >
              {done.includes(h.id) ? '✓ ' : ''}
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
