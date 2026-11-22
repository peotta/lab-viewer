import { useState, type ReactNode } from 'react';

// Prompt de roteador/switch (R1#, SW1(config-if)#, Router>) ou de shell ($).
const PROMPT_CLI = /^([A-Za-z][\w.-]*(?:\([^)]*\))?[#>])(\s*)(.*)$/;
const PROMPT_SH = /^(\$)(\s+)(.*)$/;

function isComment(line: string, lang: string) {
  const t = line.trimStart();
  if (lang === 'cisco') return t.startsWith('!');
  if (lang === 'bash' || lang === 'yaml' || lang === 'conf' || lang === 'nginx') return t.startsWith('#') && !PROMPT_CLI.test(t);
  return false;
}

function renderLine(line: string, lang: string): ReactNode {
  if (isComment(line, lang)) return <span className="italic text-[var(--code-comment)]">{line}</span>;
  const m = (lang === 'cisco' || lang === 'text' ? PROMPT_CLI : lang === 'bash' ? PROMPT_SH : null)?.exec(line);
  if (m) {
    return (
      <>
        <span className="font-semibold text-[var(--code-prompt)]">{m[1]}</span>
        {m[2]}
        {m[3]}
      </>
    );
  }
  return line;
}

/** Texto copiável: remove o prompt de cada linha, para colar direto no terminal ou no roteador. */
function commandsOnly(code: string, lang: string) {
  if (lang !== 'cisco' && lang !== 'bash') return code;
  const re = lang === 'bash' ? PROMPT_SH : PROMPT_CLI;
  return code
    .split('\n')
    .map((l) => re.exec(l)?.[3] ?? l)
    .join('\n');
}

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const rotulo = lang === 'cisco' ? 'Cisco IOS' : lang === 'bash' ? 'Linux' : lang === 'text' || !lang ? 'Saída' : lang;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commandsOnly(code, lang));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* área de transferência indisponível */
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-line bg-[var(--code-bg)]">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-surface2 px-3 py-1">
        <span className="font-mono text-sm font-semibold text-muted">{rotulo}</span>
        <button
          type="button"
          onClick={copy}
          className="no-print min-h-8 rounded-md border border-line bg-surface px-3 text-sm font-semibold hover:bg-bg"
          aria-label={copied ? 'Código copiado' : `Copiar o bloco de ${rotulo}`}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.95rem] leading-relaxed">
        <code>
          {code.split('\n').map((line, i, arr) => (
            <span key={i}>
              {renderLine(line, lang)}
              {i < arr.length - 1 ? '\n' : ''}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
