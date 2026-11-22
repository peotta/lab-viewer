import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' permite publicar o site em qualquer subpasta (ex.: docs/labs/ no GitHub Pages).
// O roteamento usa HashRouter, portanto recarregar qualquer página funciona em hospedagem estática.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 900, outDir: process.env.LAB_OUT || 'dist', emptyOutDir: true },
});
