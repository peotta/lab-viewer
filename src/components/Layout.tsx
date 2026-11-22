import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { meta, unidadePlural } from '../lib/data';

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('labs-theme', next ? 'dark' : 'light');
    } catch {
      /* ignorado */
    }
  }, [dark]);
  return { dark, toggle };
}

export function Layout() {
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
        Pular para o conteúdo
      </a>
      <header className="bg-brand text-white">
        <div className="mx-auto flex max-w-[92rem] flex-wrap items-center gap-3 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo-unb.jpg`} alt="Universidade de Brasília" className="h-9 w-auto rounded bg-white p-0.5" />
            <span className="text-lg font-bold leading-tight">
              {meta.codigo} <span className="font-normal opacity-90">· {unidadePlural}</span>
              <span className="block text-sm font-normal opacity-80">{meta.nome}</span>
            </span>
          </Link>
          <nav aria-label="Links da disciplina" className="ml-auto flex flex-wrap items-center gap-2 text-base">
            <Link to="/" className="rounded-lg px-3 py-1 font-semibold hover:bg-white/10">
              {unidadePlural}
            </Link>
            <a href={meta.planoUrl} className="rounded-lg px-3 py-1 font-semibold hover:bg-white/10">
              Plano de ensino
            </a>
            <a href={meta.repositorio} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-1 font-semibold hover:bg-white/10">
              Repositório<span className="sr-only"> (abre em nova aba)</span>
            </a>
            <button
              type="button"
              onClick={toggle}
              aria-pressed={dark}
              className="min-h-9 rounded-lg border border-white/40 px-3 font-semibold hover:bg-white/10"
            >
              Tema: {dark ? 'escuro' : 'claro'}
            </button>
          </nav>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-[92rem] min-w-0 flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <p className="mx-auto max-w-[92rem] px-4 py-4 text-center text-sm text-muted">
          {meta.instituicao} · {meta.departamento} · {meta.codigo} - {meta.nome} · Prof. Dr. Laerte Peotta de Melo
        </p>
      </footer>
    </div>
  );
}
