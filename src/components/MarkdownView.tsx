import { isValidElement, useMemo, type ReactNode } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Link } from 'react-router-dom';
import { CodeBlock } from './CodeBlock';
import { ImagemAmpliavel } from './ImagemAmpliavel';
import { Mermaid } from './Mermaid';
import { labs, meta, refs } from '../lib/data';
import { rehypeHeadingIds } from '../lib/rehype-ids';

export function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/** Vai até o título e o foca, para leitores de tela (a âncora do navegador conflita com o HashRouter). */
export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

const LINK = 'font-semibold text-accent underline underline-offset-2';

function DocLink({ href = '', children }: { href?: string; children?: ReactNode }) {
  if (href.startsWith('#')) {
    const id = decodeURIComponent(href.slice(1));
    return (
      <a
        href={href}
        className={LINK}
        onClick={(e) => {
          e.preventDefault();
          goTo(id);
        }}
      >
        {children}
      </a>
    );
  }
  const file = href.replace(/#.*$/, '').replace(/^\.\//, '');
  const lab = labs.find((l) => l.arquivo === file);
  if (lab) return <Link to={`/lab/${lab.id}`} className={LINK}>{children}</Link>;
  const ref = refs.find((r) => r.arquivo === file);
  if (ref) return <Link to={`/ref/${ref.id}`} className={LINK}>{children}</Link>;
  const rel = /^(\.\/)?topologias\//.test(href);
  const url = /^\.\.\/README\.md/.test(href) ? meta.readmeUrl : rel ? `${import.meta.env.BASE_URL}${href.replace(/^\.\//, '')}` : href;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={LINK}>
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

/** Imagens do repositório (../images/x.png) são servidas de images/ no site. */
const imgSrc = (src = '') => src.replace(/^(\.\.\/|\.\/)+images\//, `${import.meta.env.BASE_URL}images/`);

interface Props {
  md: string;
  labId?: string;
  steps?: string[];
  done?: string[];
  onToggle?: (step: string) => void;
}

export function MarkdownView({ md, labId, steps = [], done = [], onToggle }: Props) {
  const components = useMemo<Components>(() => {
    const heading = (Tag: 'h2' | 'h3' | 'h4', cls: string) =>
      function Heading({ id, children }: { id?: string; children?: ReactNode }) {
        const isStep = !!labId && !!onToggle && Tag !== 'h2' && !!id && steps.includes(id);
        const ok = isStep && !!id && done.includes(id);
        const h = (
          <Tag id={id} className={`scroll-mt-4 ${cls} ${ok ? 'text-accent' : ''}`}>
            {children}
          </Tag>
        );
        if (!isStep || !id) return h;
        return (
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0 flex-1">{h}</div>
            <button
              type="button"
              aria-pressed={ok}
              onClick={() => onToggle?.(id)}
              className={`no-print mt-5 min-h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold ${
                ok ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface hover:bg-surface2'
              }`}
            >
              {ok ? '✓ Passo concluído' : 'Marcar como feito'}
            </button>
          </div>
        );
      };

    return {
      h1: ({ children }) => <h1 className="text-3xl font-bold leading-tight">{children}</h1>,
      h2: heading('h2', 'mt-12 border-b border-line pb-2 text-2xl font-bold'),
      h3: heading('h3', 'mt-9 text-xl font-bold'),
      h4: heading('h4', 'mt-7 text-lg font-bold'),
      p: ({ children }) => <p className="my-3 text-[1.05rem] leading-relaxed">{children}</p>,
      ul: ({ children, className }) => <ul className={`my-3 space-y-1 pl-6 text-[1.05rem] ${className?.includes('contains-task-list') ? '' : 'list-disc'}`}>{children}</ul>,
      ol: ({ children }) => <ol className="my-3 list-decimal space-y-2 pl-6 text-[1.05rem]">{children}</ol>,
      hr: () => <hr className="my-8 border-line" />,
      blockquote: ({ children }) => <blockquote className="my-4 rounded-r-lg border-l-4 border-accent bg-surface2 px-4 py-2">{children}</blockquote>,
      a: DocLink,
      img: ({ src, alt, width, height }) => {
        // O logotipo do podcast, dos blocos de material de apoio, aparece maior que o tamanho do Markdown (120 px).
        const podcast = /latencia-zero-podcast/.test(src ?? '');
        // Logotipos pequenos ficam como estão; as demais imagens (infográficos, topologias) ganham o botão "Ampliar imagem".
        const logo = podcast || /logo/.test(src ?? '') || (Number(width) > 0 && Number(width) <= 200);
        if (!logo) return <ImagemAmpliavel src={imgSrc(src)} alt={alt ?? ''} width={width} height={height} />;
        return <img src={imgSrc(src)} alt={alt ?? ''} width={podcast ? 180 : width} height={podcast ? undefined : height} loading="lazy" className={podcast ? 'my-1 mx-auto' : 'my-4 mx-auto'} />;
      },
      table: ({ children }) => (
        <div className="my-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-base">{children}</table>
        </div>
      ),
      thead: ({ children }) => <thead className="bg-surface2">{children}</thead>,
      th: ({ children }) => <th scope="col" className="border-b border-line px-3 py-2 font-semibold">{children}</th>,
      td: ({ children }) => <td className="border-b border-line px-3 py-2 align-top">{children}</td>,
      pre: ({ children }) => <>{children}</>,
      code: ({ className, children }) => {
        const code = textOf(children).replace(/\n$/, '');
        const lang = /language-([\w-]+)/.exec(className ?? '')?.[1] ?? '';
        if (lang === 'mermaid') {
          const sequence = /^\s*sequenceDiagram/.test(code);
          const label = sequence
            ? 'Diagrama de sequência de mensagens do laboratório.'
            : 'Diagrama de topologia da rede do laboratório.';
          return <Mermaid code={code} label={label} />;
        }
        if (lang || code.includes('\n')) return <CodeBlock code={code} lang={lang} />;
        return <code className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-[0.92em]">{children}</code>;
      },
    };
  }, [labId, steps, done, onToggle]);

  return (
    <div className="md min-w-0 max-w-4xl">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHeadingIds]} components={components}>
        {md}
      </Markdown>
    </div>
  );
}
