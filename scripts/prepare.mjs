// Lê os roteiros em Markdown definidos em config/<disciplina>.json e gera src/generated/labs.json.
// Uso: node scripts/prepare.mjs [config/ene0025.json]
import fs from 'node:fs';
import path from 'node:path';

const cfgPath = process.argv[2] || process.env.LAB_CONFIG || 'config/ene0025.json';
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
// Caminhos do config são relativos à raiz da disciplina (variável DISCIPLINA_DIR).
// Caminhos iniciados por "@/" são relativos a este repositório (ex.: @/assets/logo.png).
const raiz = process.env.DISCIPLINA_DIR;
if (!raiz) throw new Error('Defina a variável DISCIPLINA_DIR com a pasta raiz da disciplina.');
const caminho = (p) => (p.startsWith('@/') ? p.slice(2) : path.resolve(raiz, p));
cfg.labsDir = caminho(cfg.labsDir);
cfg.imagesDir = cfg.imagesDir && caminho(cfg.imagesDir);
const re = new RegExp(cfg.arquivoLab);
const prefixoTitulo = cfg.tituloPrefixo ? new RegExp(cfg.tituloPrefixo, 'i') : /^Laborat[óo]rio \d+\s*[-:]\s*/i;

// A linha final de navegação do Markdown (Anterior | Índice Geral | Próximo) repete a navegação do site e fica oculta aqui.
const NAVEGACAO_FINAL = /(\n+---)?\n+\[[^\n]*\]\(\.\.\/README\.md\)[^\n]*\s*$/;

const lerMd = (arquivo) => fs.readFileSync(arquivo, 'utf-8').replace(/\r\n/g, '\n').replace(NAVEGACAO_FINAL, '\n');

const titulo = (md, fallback) => (/^# (.+)$/m.exec(md)?.[1] ?? fallback).replace(/[*`]/g, '').trim();

const labs = fs
  .readdirSync(cfg.labsDir)
  .map((f) => ({ f, m: re.exec(f) }))
  .filter((x) => x.m)
  .map(({ f, m }) => {
    const md = lerMd(path.join(cfg.labsDir, f));
    const id = m[1].padStart(2, '0');
    const full = titulo(md, `Laboratório ${id}`);
    return { id, n: Number(m[1]), arquivo: f, titulo: full, curto: full.replace(prefixoTitulo, ''), md };
  })
  .sort((a, b) => a.n - b.n);

const refs = (cfg.referencias || []).map((r) => {
  const md = lerMd(path.join(cfg.labsDir, r.arquivo));
  return { id: r.id, arquivo: r.arquivo, rotulo: r.rotulo, titulo: titulo(md, r.rotulo), md };
});

const { labsDir, imagesDir, arquivoLab, referencias, copiar, tituloPrefixo, ...meta } = cfg;
fs.mkdirSync('src/generated', { recursive: true });
fs.writeFileSync('src/generated/labs.json', JSON.stringify({ meta, labs, refs }));

// Imagens referenciadas pelos roteiros (../images/...) ficam em public/images.
fs.rmSync('public/images', { recursive: true, force: true });
for (const c of ['topologias']) fs.rmSync(path.join('public', c), { recursive: true, force: true });
if (imagesDir && fs.existsSync(imagesDir)) fs.cpSync(imagesDir, 'public/images', { recursive: true });
// Arquivos extras (ex.: topologias .pkt, logotipos) copiados para public/.
for (const c of copiar || []) {
  const de = caminho(c.de);
  if (!fs.existsSync(de)) continue;
  fs.mkdirSync(path.dirname(path.join('public', c.para)), { recursive: true });
  fs.cpSync(de, path.join('public', c.para), { recursive: true });
}
console.log(`${labs.length} laboratórios, ${refs.length} referência(s) a partir de ${cfg.labsDir}`);
