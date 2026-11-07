"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  /** Used for alt text, e.g. the bot or project name. */
  label: string;
  className?: string;
}

/**
 * Thumbnail grid that opens a full-screen viewer (click, ←/→, Esc).
 * The viewer is portaled to <body>: ancestors with backdrop-filter/transform would otherwise
 * become the containing block for `position: fixed` and trap it inside the card.
 */
export default function ImageGallery({ images, label, className }: ImageGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);
  const count = images.length;

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % count));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + count) % count));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count]);

  if (count === 0) return null;

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-3", className)}>
        {images.map((src, i) => (
          <button
            key={`${i}-${src}`}
            type="button"
            onClick={() => setOpen(i)}
            className="group overflow-hidden rounded-xl border border-slate-900 bg-zinc-950"
          >
            <img
              src={src}
              alt={`${label}: imagem ${i + 1}`}
              loading="lazy"
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
          >
            <button className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10" aria-label="Fechar">
              <X className="h-6 w-6" />
            </button>
            {count > 1 && (
              <>
                <button
                  className="absolute left-4 rounded-full p-2 text-white hover:bg-white/10"
                  aria-label="Anterior"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open - 1 + count) % count);
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  className="absolute right-4 rounded-full p-2 text-white hover:bg-white/10"
                  aria-label="Próxima"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open + 1) % count);
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <img
              src={images[open]}
              alt=""
              className="max-h-full max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {count > 1 && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                {open + 1} / {count}
              </span>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
