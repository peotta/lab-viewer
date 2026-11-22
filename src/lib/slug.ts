/** Âncora de um título, no padrão do GitHub: minúsculas, sem pontuação, espaços viram hífens. */
export const slug = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');

export interface Heading {
  id: string;
  text: string;
  level: number;
  secao: number; // número da seção de nível 2 (4 = Roteiro Prático)
}

/** Títulos (h2 a h4) do Markdown, ignorando blocos de código, com ids únicos no padrão do GitHub. */
export function headingsOf(markdown: string): Heading[] {
  const out: Heading[] = [];
  const seen = new Map<string, number>();
  let fence = false;
  let secao = 0;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) fence = !fence;
    if (fence) continue;
    const m = /^(#{2,4}) (.+)$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[*`_]/g, '').trim();
    const level = m[1].length;
    if (level === 2) secao = Number(/^(\d+)\./.exec(text)?.[1] ?? 0);
    const base = slug(text);
    const k = seen.get(base) ?? 0;
    seen.set(base, k + 1);
    out.push({ id: k ? `${base}-${k}` : base, text, level, secao });
  }
  return out;
}

/**
 * Passos executáveis do roteiro: títulos finais (sem subtítulos) da seção indicada (padrão 4) (Roteiro Prático),
 * e títulos finais de nível 4 da seção 5 (testes de verificação).
 */
export function stepsOf(markdown: string, secaoPassos = 4): Heading[] {
  const hs = headingsOf(markdown);
  return hs.filter((h, i) => {
    if (h.level < 3) return false;
    const proximo = hs[i + 1];
    const folha = !proximo || proximo.level <= h.level;
    return folha && (h.secao === secaoPassos || (h.secao === secaoPassos + 1 && h.level === 4));
  });
}
