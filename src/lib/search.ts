import { labs, refs, unidadeAbrev } from './data';
import { slug } from './slug';

export interface Hit {
  doc: string; // rota: lab/03 ou ref/comandos
  docTitle: string;
  headingId: string;
  heading: string;
  snippet: string;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Busca simples (sem acentos, sem diferenciar maiúsculas) no texto de todos os roteiros. */
export function search(query: string, limit = 40): Hit[] {
  const q = norm(query.trim());
  if (q.length < 3) return [];
  const docs = [
    ...labs.map((l) => ({ doc: `lab/${l.id}`, title: `${unidadeAbrev} ${l.id} - ${l.curto}`, md: l.md })),
    ...refs.map((r) => ({ doc: `ref/${r.id}`, title: r.rotulo, md: r.md })),
  ];
  const hits: Hit[] = [];
  for (const d of docs) {
    const seen = new Map<string, number>();
    let heading = d.title;
    let headingId = '';
    let fence = false;
    let found = 0;
    for (const line of d.md.split('\n')) {
      if (line.startsWith('```')) fence = !fence;
      const h = !fence ? /^(#{2,4}) (.+)$/.exec(line) : null;
      if (h) {
        heading = h[2].replace(/[*`_]/g, '').trim();
        const base = slug(heading);
        const k = seen.get(base) ?? 0;
        seen.set(base, k + 1);
        headingId = k ? `${base}-${k}` : base;
      }
      if (found < 3 && norm(line).includes(q)) {
        found++;
        hits.push({ doc: d.doc, docTitle: d.title, headingId, heading, snippet: line.replace(/[*`_#>|]/g, '').trim().slice(0, 140) });
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}
