import { useEffect, useRef, useState } from 'react';

const btn = 'rounded-lg border border-line bg-surface px-3 py-1.5 text-base font-semibold hover:bg-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

// Janela com a imagem em tela cheia, com zoom (nativo <dialog>: Esc fecha, foco preso). Mesmo comportamento do diagrama Mermaid.
function Ampliada({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState(0); // largura natural da imagem (px)
  const [zoom, setZoom] = useState(1);

  const fit = (w = natural) => {
    if (!w || !area.current) return;
    setZoom(Math.max(0.1, Math.min(4, (area.current.clientWidth - 32) / w)));
  };

  useEffect(() => {
    dlg.current?.showModal();
  }, []);

  return (
    <dialog ref={dlg} onClose={onClose} aria-label={alt} className="m-0 h-screen max-h-none w-screen max-w-none bg-bg p-0 text-ink backdrop:bg-black/60">
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface p-3">
          <button type="button" className={btn} onClick={() => setZoom((z) => Math.max(0.1, z / 1.25))} aria-label="Diminuir o zoom">
            -
          </button>
          <span className="min-w-14 text-center text-base" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" className={btn} onClick={() => setZoom((z) => Math.min(4, z * 1.25))} aria-label="Aumentar o zoom">
            +
          </button>
          <button type="button" className={btn} onClick={() => setZoom(1)}>
            100%
          </button>
          <button type="button" className={btn} onClick={() => fit()}>
            Ajustar à largura
          </button>
          <button type="button" className={`${btn} ml-auto`} onClick={() => dlg.current?.close()}>
            Fechar
          </button>
        </div>
        <div ref={area} className="flex-1 overflow-auto p-4">
          <img
            src={src}
            alt={alt}
            style={{ width: natural ? natural * zoom : undefined, maxWidth: 'none' }}
            className="mx-auto block"
            onLoad={(e) => {
              const w = e.currentTarget.naturalWidth;
              setNatural(w);
              fit(w);
            }}
          />
        </div>
      </div>
    </dialog>
  );
}

/** Imagem do roteiro com o botão "Ampliar imagem", como nos diagramas Mermaid. */
export function ImagemAmpliavel({ src, alt, width, height }: { src: string; alt: string; width?: number | string; height?: number | string }) {
  const [open, setOpen] = useState(false);
  return (
    <figure className="my-4 rounded-xl border border-line bg-surface">
      <div className="flex justify-end border-b border-line px-3 py-2">
        <button type="button" className={btn} onClick={() => setOpen(true)}>
          Ampliar imagem<span className="sr-only">: {alt}</span>
        </button>
      </div>
      {open && <Ampliada src={src} alt={alt} onClose={() => setOpen(false)} />}
      <div className="overflow-x-auto p-4">
        <img src={src} alt={alt} width={width} height={height} loading="lazy" className="mx-auto h-auto max-w-full" />
      </div>
    </figure>
  );
}
