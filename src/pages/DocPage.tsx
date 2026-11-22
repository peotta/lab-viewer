import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { goTo, MarkdownView } from '../components/MarkdownView';
import { Toc, type TocItem } from '../components/Toc';
import { findLab, findRef, githubUrl, grupoDe, labs, passosDe, unidade, unidadeAbrev } from '../lib/data';
import { useProgress } from '../lib/progress';

export function DocPage({ kind }: { kind: 'lab' | 'ref' }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const { store, toggle, reset } = useProgress();
  const box = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);

  const lab = kind === 'lab' ? findLab(id) : undefined;
  const ref = kind === 'ref' ? findRef(id) : undefined;
  const doc = lab ?? ref;
  const labId = lab?.id;
  const done = useMemo(() => (labId ? (store[labId] ?? []) : []), [labId, store]);
  const steps = useMemo(() => (doc ? passosDe(labId, doc.md) : []), [doc, labId]);
  const stepIds = useMemo(() => steps.map((s) => s.id), [steps]);
  const feitos = steps.filter((s) => done.includes(s.id)).length;

  useEffect(() => {
    if (!labId) return;
    try {
      localStorage.setItem('labs-ultimo', labId);
    } catch {
      /* ignorado */
    }
  }, [labId]);

  // Índice no menu lateral: lê os títulos já renderizados (h2, h3 e passos em h4).
  useEffect(() => {
    const t = window.setTimeout(() => {
      const hs = [...(box.current?.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]') ?? [])];
      setToc(
        hs
          .filter((h) => h.tagName !== 'H4' || stepIds.includes(h.id))
          .map((h) => ({ id: h.id, text: (h.textContent ?? '').trim(), level: Number(h.tagName[1]) })),
      );
      const alvo = params.get('h');
      if (alvo) goTo(alvo);
    }, 60);
    return () => window.clearTimeout(t);
  }, [pathname, doc, params, stepIds]);

  if (!doc) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Roteiro não encontrado</h1>
        <p className="mt-2">
          <Link to="/" className="font-semibold text-accent underline">
            Voltar ao início
          </Link>
        </p>
      </div>
    );
  }

  const i = lab ? labs.findIndex((l) => l.id === lab.id) : -1;
  const prev = i > 0 ? labs[i - 1] : undefined;
  const next = i >= 0 && i < labs.length - 1 ? labs[i + 1] : undefined;
  const cor = lab ? `var(--m${grupoDe(lab.n)})` : 'var(--accent)';

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_15rem]">
    <article ref={box} className="min-w-0">
      <nav aria-label="Trilha de navegação" className="mb-3 text-base">
        <Link to="/" className="font-semibold text-accent underline">
          Início
        </Link>{' '}
        / {lab ? `${unidade} ${lab.id}` : doc.titulo}
      </nav>

      {lab && steps.length > 0 && (
        <div className="no-print mb-6 flex max-w-4xl flex-wrap items-center gap-4 rounded-xl border border-line border-l-[6px] bg-surface p-4" style={{ borderLeftColor: cor }}>
          <div className="min-w-48 flex-1">
            <p className="font-bold">
              Progresso: {feitos} de {steps.length} passos
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={feitos} aria-label="Passos concluídos">
              <div className="h-full bg-accent" style={{ width: `${(feitos / steps.length) * 100}%` }} />
            </div>
          </div>
          <a href={githubUrl(lab.arquivo)} target="_blank" rel="noopener noreferrer" className="min-h-9 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-surface2">
            Ver no GitHub<span className="sr-only"> (abre em nova aba)</span> ↗
          </a>
          {feitos > 0 && (
            <button type="button" onClick={() => reset(lab.id)} className="min-h-9 rounded-lg border border-line px-3 text-sm font-semibold hover:bg-surface2">
              Reiniciar progresso
            </button>
          )}
        </div>
      )}

      <MarkdownView md={doc.md} labId={labId} steps={stepIds} done={done} onToggle={labId ? (s) => toggle(labId, s) : undefined} />

      {lab && (
        <nav aria-label="Navegação entre roteiros" className="no-print mt-12 grid max-w-4xl gap-3 border-t border-line pt-6 sm:grid-cols-2">
          {prev ? (
            <Link to={`/lab/${prev.id}`} className="rounded-xl border border-line bg-surface p-4 hover:bg-surface2">
              <span className="block text-sm text-muted">← Anterior</span>
              <span className="font-semibold">
                {unidadeAbrev} {prev.id} · {prev.curto}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/lab/${next.id}`} className="rounded-xl border border-line bg-surface p-4 text-right hover:bg-surface2">
              <span className="block text-sm text-muted">Próximo →</span>
              <span className="font-semibold">
                {unidadeAbrev} {next.id} · {next.curto}
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>

    <aside aria-label="Índice da página" className="no-print hidden xl:sticky xl:top-4 xl:block xl:max-h-[calc(100vh-2rem)] xl:self-start xl:overflow-y-auto">
      <Toc items={toc} done={done} />
    </aside>
    </div>
  );
}
