"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface DeleteProjectButtonProps {
  projectId: string;
  projectTitle: string;
  onDeleted: () => void;
  /** Icon-only, for tight rows like the profile list. */
  compact?: boolean;
  className?: string;
}

/** Remove button with a confirmation dialog. Only render it for the project's owner. */
export default function DeleteProjectButton({ projectId, projectTitle, onDeleted, compact, className }: DeleteProjectButtonProps) {
  const { authToken, showToast } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setConfirming(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, deleting]);

  const remove = async () => {
    if (!authToken) return;
    setDeleting(true);
    const res = await fetch(`/api/public/projects/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    }).catch(() => null);
    setDeleting(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => null);
      showToast(data?.error || "Não foi possível remover o projeto.", "error");
      return;
    }
    setConfirming(false);
    showToast("Projeto removido.", "success");
    onDeleted();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Remover ${projectTitle}`}
        title="Remover projeto"
        className={cn(
          "flex shrink-0 items-center justify-center gap-1.5 border border-red-500/30 font-bold text-red-400 transition-colors hover:bg-red-500/10",
          compact ? "h-8 w-8 rounded-lg" : "h-10 rounded-xl px-3 text-xs",
          className
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {!compact && "Remover"}
      </button>

      {confirming &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            onClick={() => !deleting && setConfirming(false)}
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-zinc-950 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </span>
              <h2 id="delete-project-title" className="mt-4 break-words text-lg font-extrabold text-white">
                Remover &quot;{projectTitle}&quot;?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                O projeto, os votos dele e o anúncio no Discord serão apagados. Isso não pode ser desfeito.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  disabled={deleting}
                  onClick={() => setConfirming(false)}
                  className="h-10 rounded-xl border border-slate-800 px-4 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-900 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={remove}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-extrabold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {deleting ? "Removendo..." : "Remover projeto"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
