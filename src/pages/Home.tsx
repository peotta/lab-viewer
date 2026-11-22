import { Link } from 'react-router-dom';
import { labs, meta, passosDe, refs, unidade, unidadeAbrev } from '../lib/data';
import { useProgress } from '../lib/progress';

export function Home() {
  const { store } = useProgress();
  let ultimo: string | null = null;
  try {
    ultimo = localStorage.getItem('labs-ultimo');
  } catch {
    /* ignorado */
  }
  const ult = labs.find((l) => l.id === ultimo);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Roteiros de {unidade.toLowerCase()}</h1>
        <p className="mt-2 max-w-3xl text-lg">
          {meta.codigo} - {meta.nome}, {meta.semestre}. Siga cada roteiro na ordem: objetivos, fundamentação, topologia, passo a passo, verificação, segurança, questões e entregáveis.
        </p>
        {ult && (
          <Link to={`/lab/${ult.id}`} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 text-base font-semibold text-accent-ink hover:opacity-90">
            Continuar: {unidade} {ult.id}
          </Link>
        )}
      </section>

      {meta.simulnet && (
        <section aria-label="Simul-Net" className="flex flex-wrap items-center gap-5 rounded-xl border border-line border-l-[6px] border-l-accent bg-surface p-5">
          <img src={`${import.meta.env.BASE_URL}${meta.simulnet.imagem}`} alt="Simul-Net: simuladores de redes e protocolos" width={96} height={96} className="rounded-lg" />
          <div className="min-w-64 flex-1">
            <h2 className="text-xl font-bold">Pratique com o Simul-Net</h2>
            <p className="mt-1 max-w-3xl text-lg">{meta.simulnet.texto}</p>
          </div>
          <a
            href={meta.simulnet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 text-base font-semibold text-accent-ink hover:opacity-90"
          >
            Abrir o Simul-Net<span className="sr-only"> (abre em nova aba)</span>
            <span aria-hidden="true">&nbsp;↗</span>
          </a>
        </section>
      )}

      <section aria-label="Como usar" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Índice da página', 'Em cada roteiro, o índice à direita acompanha a leitura e leva direto ao passo desejado.'],
          ['Marque os passos', 'Use "Marcar como feito" em cada passo. O progresso fica salvo neste navegador.'],
          ['Copie os comandos', 'O botão Copiar remove o prompt (R1#, $) e deixa só o comando para colar no terminal ou no roteador.'],
          ['Siga em sequência', 'No fim de cada roteiro, os botões Anterior e Próximo levam ao roteiro vizinho.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-line bg-surface p-4">
            <h2 className="font-bold text-accent">{t}</h2>
            <p className="mt-1 text-base">{d}</p>
          </div>
        ))}
      </section>

      {meta.grupos.map((g, gi) => (
        <section key={g.sigla} aria-label={g.titulo}>
          <h2 className="mb-3 text-xl font-bold" style={{ color: `var(--m${(gi % 4) + 1})` }}>
            {g.sigla} · {g.titulo}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {g.labs.map((n) => {
              const lab = labs.find((l) => l.n === n);
              if (!lab) return null;
              const total = passosDe(lab.id, lab.md).length;
              const feitos = Math.min(total, (store[lab.id] ?? []).length);
              const pct = total ? Math.round((feitos / total) * 100) : 0;
              return (
                <Link
                  key={lab.id}
                  to={`/lab/${lab.id}`}
                  className="flex flex-col gap-2 rounded-xl border border-line border-l-[6px] bg-surface p-4 hover:bg-surface2"
                  style={{ borderLeftColor: `var(--m${(gi % 4) + 1})` }}
                >
                  <span className="font-mono text-sm font-bold" style={{ color: `var(--m${(gi % 4) + 1})` }}>
                    {unidadeAbrev.toUpperCase()} {lab.id}
                  </span>
                  <span className="text-lg font-semibold leading-snug">{lab.curto}</span>
                  <span className="mt-auto text-sm text-muted">{total ? `${feitos} de ${total} passos concluídos` : 'Roteiro de leitura'}</span>
                  {total > 0 && (
                    <span className="h-1.5 overflow-hidden rounded-full bg-surface2" aria-hidden="true">
                      <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {refs.length > 0 && (
        <section aria-label="Referência">
          <h2 className="mb-3 text-xl font-bold">Referência</h2>
          {refs.map((r) => (
            <Link key={r.id} to={`/ref/${r.id}`} className="inline-flex rounded-xl border border-line bg-surface px-4 py-3 text-lg font-semibold hover:bg-surface2">
              {r.rotulo}
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
