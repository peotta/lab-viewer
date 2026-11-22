import raw from '../generated/labs.json';
import { stepsOf } from './slug';

export interface Lab {
  id: string;
  n: number;
  arquivo: string;
  titulo: string;
  curto: string;
  md: string;
}
export interface Ref {
  id: string;
  arquivo: string;
  rotulo: string;
  titulo: string;
  md: string;
}
export interface Grupo {
  titulo: string;
  sigla: string;
  labs: number[];
}
export interface Meta {
  codigo: string;
  nome: string;
  semestre: string;
  instituicao: string;
  departamento: string;
  repositorio: string;
  planoUrl: string;
  readmeUrl: string;
  grupos: Grupo[];
  unidade?: string; // ex.: Laboratório, Experimento
  unidadeAbrev?: string; // ex.: Lab, Exp
  pastaRoteiros?: string; // pasta no GitHub
  secaoPassos?: Record<string, number>; // seção dos passos por roteiro (padrão 4)
  simulnet?: { url: string; imagem: string; texto: string };
}

export const meta = raw.meta as Meta;
export const labs = raw.labs as Lab[];
export const refs = raw.refs as Ref[];

export const findLab = (id?: string) => labs.find((l) => l.id === id);
export const findRef = (id?: string) => refs.find((r) => r.id === id);

/** Índice (1 a 4) do grupo ao qual o laboratório pertence; define a cor. */
export const grupoDe = (n: number) => {
  const i = meta.grupos.findIndex((g) => g.labs.includes(n));
  return i < 0 ? 1 : (i % 4) + 1;
};

/** Link do arquivo no GitHub. */
export const githubUrl = (arquivo: string) => `${meta.repositorio}/blob/main/${meta.pastaRoteiros ?? 'labs'}/${arquivo}`;

/** Nome da unidade (Laboratório, Experimento) e sua abreviação, usados nos textos da interface. */
export const unidade = meta.unidade ?? 'Laboratório';
export const unidadeAbrev = meta.unidadeAbrev ?? 'Lab';
export const unidadePlural = `${unidade}s`;

/** Passos executáveis de um roteiro, considerando a seção configurada para ele. */
export const passosDe = (id: string | undefined, md: string) => stepsOf(md, (id && meta.secaoPassos?.[id]) || 4);
