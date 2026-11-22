import { slug } from './slug';

type Node = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: Node[] };

const textOf = (n: Node): string => (n.type === 'text' ? (n.value ?? '') : (n.children ?? []).map(textOf).join(''));

/** Dá a cada título (h2 a h4) um id no padrão do GitHub, sem repetições dentro do documento. */
export function rehypeHeadingIds() {
  return (tree: Node) => {
    const seen = new Map<string, number>();
    const walk = (n: Node) => {
      if (n.type === 'element' && n.tagName && /^h[2-4]$/.test(n.tagName)) {
        const base = slug(textOf(n).replace(/[*`_]/g, '').trim());
        const k = seen.get(base) ?? 0;
        seen.set(base, k + 1);
        n.properties = { ...n.properties, id: k ? `${base}-${k}` : base };
      }
      n.children?.forEach(walk);
    };
    walk(tree);
  };
}
