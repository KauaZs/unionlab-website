"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Uploads one image through the API (which stores it on Catbox) and returns its URL. */
export async function uploadImageFile(file: File, authToken: string): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Use PNG, JPG, GIF ou WEBP.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("A imagem deve ter no máximo 4 MB.");
  const data = await readAsDataUrl(file);
  const res = await fetch("/api/public/uploads/image", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ data }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) throw new Error(body.error || "Falha ao enviar a imagem.");
  return body.url as string;
}

interface ImageUploadProps {
  authToken: string;
  /** Current image URLs. */
  value: string[];
  onChange: (urls: string[]) => void;
  max: number;
  onError: (message: string) => void;
  /** Wide single slot (cover) vs. grid of thumbnails (screenshots). */
  variant: "cover" | "gallery";
  hint: string;
}

export default function ImageUpload({ authToken, value, onChange, max, onError, variant, hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = max - value.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) onError(`Você pode enviar no máximo ${max} ${max === 1 ? "imagem" : "imagens"}.`);

    setUploading((n) => n + picked.length);
    const results = await Promise.allSettled(picked.map((f) => uploadImageFile(f, authToken)));
    setUploading((n) => n - picked.length);

    const urls: string[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") urls.push(r.value);
      else onError((r.reason as Error).message);
    }
    if (urls.length) onChange([...value, ...urls].slice(0, max));
    if (inputRef.current) inputRef.current.value = "";
  };

  const canAdd = value.length + uploading < max;
  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  const picker = (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={!canAdd}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 bg-zinc-950/40 text-slate-500 transition-colors hover:border-slate-600 hover:text-slate-300 disabled:hidden",
        variant === "cover" ? "aspect-[16/9] w-full" : "aspect-video"
      )}
    >
      <ImagePlus className="h-6 w-6" />
      <span className="text-xs font-bold">{variant === "cover" ? "Enviar capa" : "Adicionar"}</span>
      <span className="text-[10px]">{hint}</span>
    </button>
  );

  const spinner = (key: number) => (
    <div key={`up-${key}`} className="flex aspect-video items-center justify-center rounded-xl border border-slate-900 bg-zinc-950/60">
      <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
    </div>
  );

  const thumb = (url: string, i = 0) => (
    <div key={`${i}-${url}`} className="group relative overflow-hidden rounded-xl border border-slate-900">
      <img src={url} alt="" className={cn("w-full object-cover", variant === "cover" ? "aspect-[16/9]" : "aspect-video")} />
      <button
        type="button"
        onClick={() => remove(url)}
        aria-label="Remover imagem"
        className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-90 hover:bg-red-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple={max > 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {variant === "cover" ? (
        value[0] ? thumb(value[0]) : uploading ? <div className="aspect-[16/9]">{spinner(0)}</div> : picker
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map(thumb)}
          {Array.from({ length: uploading }).map((_, i) => spinner(i))}
          {canAdd && picker}
        </div>
      )}
    </div>
  );
}
