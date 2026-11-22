# Visualizador de Roteiros de Laboratório (UnB)

Gera um site estático que lê os roteiros em Markdown de uma disciplina e os apresenta com índice lateral, passos marcáveis com progresso salvo no navegador, cópia de comandos sem o *prompt*, tema claro e escuro e diagramas Mermaid. Usado pelas disciplinas ENE0025 (Protocolos de Transporte e Roteamento) e ENE0011 (Laboratório de Redes) da Universidade de Brasília (UnB).

Base técnica: React, Vite, Tailwind, `react-markdown`, `remark-gfm` e Mermaid, com roteamento por *hash* (`HashRouter`), que permite publicar em qualquer subpasta do GitHub Pages.

## Como funciona

O site não lê os arquivos `.md` em tempo de execução. Na compilação, `scripts/prepare.mjs` lê os roteiros definidos em `config/<disciplina>.json` e gera `src/generated/labs.json`; em seguida o Vite empacota o resultado. Uma alteração nos roteiros só aparece no site depois de uma nova compilação.

## Configuração por disciplina

Cada arquivo em `config/` define:

| Campo | Função |
|:------|:-------|
| `labsDir`, `imagesDir` | Pastas dos roteiros e das imagens, relativas à raiz da disciplina |
| `arquivoLab` | Expressão regular do nome dos arquivos; o primeiro grupo é o número do roteiro |
| `tituloPrefixo` | Trecho removido do título para compor o nome curto (opcional) |
| `unidade`, `unidadeAbrev` | Termo usado na interface (por exemplo, Laboratório / Lab) |
| `pastaRoteiros` | Pasta dos roteiros no repositório, usada no link "Ver no GitHub" |
| `secaoPassos` | Seção que contém os passos executáveis de cada roteiro (padrão: 4) |
| `copiar` | Arquivos extras copiados para o site; `@/` indica caminho neste repositório |
| `grupos` | Módulos exibidos na página inicial |
| `simulnet` | Bloco de chamada para o Simul-Net (opcional) |

## Uso local

```bash
npm ci
DISCIPLINA_DIR="/caminho/da/disciplina" LAB_CONFIG=config/ene0025.json LAB_OUT=dist npm run build
```

`DISCIPLINA_DIR` é a pasta raiz da disciplina (a que contém `labs/` e `images/`). O resultado em `LAB_OUT` pode ser servido por qualquer servidor estático.

## Publicação automática

Cada repositório de disciplina contém um fluxo de trabalho (`.github/workflows/labs.yml`) que, a cada *push* em `labs/` ou `images/`, baixa este repositório, compila o site com o config da disciplina e grava o resultado em `docs/labs/`, publicado pelo GitHub Pages.

## Convenções dos roteiros

- Passo executável: título final (sem subtítulos) da seção indicada em `secaoPassos` (padrão `## 4.`); na seção seguinte, títulos finais de nível 4.
- A linha final de navegação do Markdown (Anterior, Índice Geral, Próximo) é ocultada, pois o site tem navegação própria.
- Imagens do repositório (`../images/x.png`) são servidas de `images/`.
- Links entre roteiros viram navegação interna; `../README.md` abre o README da disciplina no GitHub.
