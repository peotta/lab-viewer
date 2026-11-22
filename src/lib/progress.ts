import { useCallback, useEffect, useState } from 'react';

const KEY = 'labs-progresso';
type Store = Record<string, string[]>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* armazenamento indisponível: o progresso vale só enquanto a página estiver aberta */
  }
  window.dispatchEvent(new Event('labs-progresso'));
}

/** Passos concluídos de todos os laboratórios, salvos no navegador do aluno. */
export function useProgress() {
  const [store, setStore] = useState<Store>(read);
  useEffect(() => {
    const on = () => setStore(read());
    window.addEventListener('labs-progresso', on);
    window.addEventListener('storage', on);
    return () => {
      window.removeEventListener('labs-progresso', on);
      window.removeEventListener('storage', on);
    };
  }, []);
  const toggle = useCallback((lab: string, step: string) => {
    const s = read();
    const cur = new Set(s[lab] ?? []);
    if (cur.has(step)) cur.delete(step);
    else cur.add(step);
    write({ ...s, [lab]: [...cur] });
  }, []);
  const reset = useCallback((lab: string) => {
    const s = read();
    delete s[lab];
    write(s);
  }, []);
  return { store, toggle, reset };
}
