"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ShieldAlert, Star, Trash2 } from "lucide-react";
import Stars from "./Stars";
import SupporterBadge from "./SupporterBadge";
import { userAvatarUrl } from "./ProjectCard";
import { Textarea } from "./ui/textarea";
import { useApp } from "@/context/AppContext";
import { fetchJson, startLogin } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  isSupporter?: boolean;
  rating: number;
  comment: string;
  date: string;
}

const MAX_COMMENT = 500;
const panel = "rounded-2xl border border-slate-900 bg-zinc-950/60";

/** Rating form and review list. `onChanged` lets the page refresh the average. */
export default function ProjectReviews({ projectId, onChanged }: { projectId: string; onChanged: () => void }) {
  const { user, authToken, showToast } = useApp();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mine = reviews?.find((r) => r.userId === user?.id);
  const url = `/api/public/projects/${projectId}/feedbacks`;

  const userId = user?.id;
  const load = useCallback(() => {
    fetchJson<Review[]>(`/api/public/projects/${projectId}/feedbacks`)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setReviews(list);
        setLoadFailed(false);
        // Start the form from the user's existing review, if any.
        const own = list.find((r) => r.userId === userId);
        if (own) {
          setRating(own.rating);
          setComment(own.comment);
        }
      })
      .catch(() => setLoadFailed(true));
  }, [projectId, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (method: "POST" | "PUT" | "DELETE") => {
    if (!authToken) return;
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: method === "DELETE" ? undefined : JSON.stringify({ rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Não foi possível salvar sua avaliação.");
        return;
      }
      if (method === "DELETE") {
        setRating(5);
        setComment("");
        showToast("Avaliação removida.", "info");
      } else {
        showToast(method === "POST" ? "Avaliação enviada!" : "Avaliação atualizada!", "success");
      }
      load();
      onChanged();
    } catch {
      setFormError("Erro de conexão ao salvar sua avaliação.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
        Avaliações{reviews && reviews.length > 0 ? ` (${reviews.length})` : ""}
      </h2>

      {user ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(mine ? "PUT" : "POST");
          }}
          className={cn(panel, "space-y-4 p-5")}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-200">{mine ? "Sua avaliação" : "Avalie este projeto"}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={star === 1 ? "1 estrela" : `${star} estrelas`}
                  aria-pressed={rating === star}
                  className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className={cn("h-6 w-6", rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-700 hover:text-slate-500")} />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Conte o que você achou do projeto..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={MAX_COMMENT}
            className="min-h-[96px]"
          />
          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={saving || comment.trim().length === 0}
              className="h-10 rounded-xl bg-white px-5 text-xs font-extrabold text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Salvando..." : mine ? "Salvar alterações" : "Enviar avaliação"}
            </button>
            {mine && (
              <button
                type="button"
                disabled={saving}
                onClick={() => send("DELETE")}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-red-500/30 px-4 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            )}
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={startLogin}
          className={cn(panel, "w-full p-5 text-center text-sm font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-white")}
        >
          Faça login para deixar uma avaliação
        </button>
      )}

      {loadFailed ? (
        <p className="py-6 text-center text-sm font-medium text-slate-500">Não foi possível carregar as avaliações.</p>
      ) : reviews === null ? (
        <div className="h-24 animate-pulse rounded-2xl border border-slate-900 bg-zinc-950/60" />
      ) : reviews.length === 0 ? (
        <p className="py-6 text-center text-sm font-medium text-slate-500">Nenhuma avaliação ainda. Seja o primeiro!</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className={cn(panel, "flex gap-4 p-5")}>
            <Link href={`/user/${r.userId}`} className="shrink-0">
              <img className="h-10 w-10 rounded-full object-cover" src={userAvatarUrl(r.userId, r.avatar)} alt="" />
            </Link>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/user/${r.userId}`} className="flex items-center gap-1.5 text-sm font-bold text-slate-200 hover:text-white">
                  {r.username}
                  {r.isSupporter && <SupporterBadge />}
                </Link>
                <Stars rating={r.rating} size={12} />
              </div>
              <p className="break-words text-sm leading-relaxed text-slate-400">{r.comment}</p>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <Calendar className="h-3 w-3" />
                {new Date(r.date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
