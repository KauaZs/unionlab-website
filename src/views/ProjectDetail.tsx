"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ExternalLink, Flame, Link2, Calendar, Clock, XCircle, Trash2, Share2, Pencil, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import Markdown from "@/components/Markdown";
import ReCaptcha from "@/components/ReCaptcha";
import { userAvatarUrl } from "@/components/ProjectCard";
import { useApp } from "@/context/AppContext";
import { useCountdown } from "@/hooks/useCountdown";
import { ApiError, fetchJson, startLogin } from "@/lib/api";
import { PROJECT_TYPE_BY_ID, TAB_SLUGS, embedUrlFor, hostOf, projectGradient } from "@/lib/projectTypes";
import { cn } from "@/lib/utils";
import type { Project, ProjectType } from "@/lib/types";

const OPEN_LABEL: Record<ProjectType, string> = {
  website: "Visitar site",
  game: "Jogar agora",
  music: "Ouvir agora",
  other: "Abrir projeto",
};

export default function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user, authToken, showToast, showCelebration, refreshUser, recaptchaSiteKey } = useApp();
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound" | "error">("loading");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteCooldown, setVoteCooldown] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const cooldownText = useCountdown(voteCooldown ?? user?.cooldowns?.voteProject);

  const load = useCallback(() => {
    fetchJson<Project>(`/api/public/projects/${id}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    })
      .then((p) => {
        setProject(p);
        setStatus("ready");
      })
      .catch((err) => setStatus(err instanceof ApiError && err.status === 404 ? "notfound" : "error"));
  }, [id, authToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVote = async () => {
    if (!authToken || !project) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/public/projects/${project.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ captchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.cooldownExpiresAt) setVoteCooldown(data.cooldownExpiresAt);
      if (!res.ok) {
        showToast(data.error || "Falha ao registrar voto.", "error");
        return;
      }
      showCelebration("Voto Computado! 🔥", `Seu voto em ${project.title} foi registrado!`, `+${data.coinsEarned ?? 0} Unicoins`);
      refreshUser();
      load();
    } catch {
      showToast("Erro de conexão ao votar.", "error");
    } finally {
      setVoting(false);
      setCaptchaToken(null);
    }
  };

  const handleDelete = async () => {
    if (!project || !authToken) return;
    if (!window.confirm(`Remover "${project.title}" permanentemente? Os votos também serão apagados.`)) return;
    const res = await fetch(`/api/public/projects/${project.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    }).catch(() => null);
    if (!res?.ok) {
      showToast("Não foi possível remover o projeto.", "error");
      return;
    }
    showToast("Projeto removido.", "success");
    router.push("/");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copiado!", "success");
    } catch {
      showToast("Não foi possível copiar o link.", "error");
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-52 w-full animate-pulse rounded-3xl bg-zinc-950/60 sm:h-72 md:h-80" />
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-zinc-950/60" />
      </div>
    );
  }
  if (status !== "ready" || !project) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-bold text-white">{status === "notfound" ? "Projeto não encontrado" : "Não foi possível carregar o projeto"}</p>
        <p className="text-sm text-slate-500">
          {status === "notfound" ? "Ele pode ter sido removido ou ainda estar em análise." : "Tente novamente em instantes."}
        </p>
        <Link href="/" className="text-xs font-bold text-white underline underline-offset-4">
          Voltar para o início
        </Link>
      </div>
    );
  }

  const type = PROJECT_TYPE_BY_ID[project.type];
  const TypeIcon = type.icon;
  const embed = embedUrlFor(project.url);
  const isOwner = user?.id === project.ownerId;
  const canVote = project.status === "approved" && !isOwner;

  return (
    <div className="space-y-8">
      <Link href={`/?tab=${TAB_SLUGS[project.type]}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" />
        {type.plural}
      </Link>

      {project.status !== "approved" && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border p-4 text-sm",
            project.status === "pending" ? "border-amber-500/25 bg-amber-500/5 text-amber-200" : "border-red-500/25 bg-red-500/5 text-red-200"
          )}
        >
          {project.status === "pending" ? <Clock className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <div>
            <p className="font-bold">{project.status === "pending" ? "Aguardando análise" : "Projeto recusado"}</p>
            <p className="text-xs opacity-80">
              {project.status === "pending"
                ? "Só você consegue ver esta página. Ela fica pública assim que a equipe aprovar."
                : "Este projeto não foi aprovado. Você recebeu o motivo nas notificações e pode editá-lo para reenviar."}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="overflow-hidden rounded-3xl border border-slate-900 bg-zinc-950/60">
        <div className="relative h-52 w-full sm:h-72 md:h-80" style={{ background: projectGradient(project.type) }}>
          {project.coverImage ? (
            <img src={project.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <TypeIcon className={cn("h-16 w-16 opacity-50", type.text)} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>
        <div className="relative -mt-20 space-y-3 px-6 pb-6 md:px-8">
          <span className={cn("inline-flex items-center gap-1 rounded-full border bg-zinc-950/70 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur", type.text, type.border)}>
            <TypeIcon className="h-3.5 w-3.5" />
            {type.label}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{project.title}</h1>
          <p className="max-w-2xl text-base font-medium text-slate-300">{project.summary}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-semibold text-slate-400">
            <Link href={`/user/${project.ownerId}`} className="flex items-center gap-2 hover:text-white">
              <img src={userAvatarUrl(project.ownerId, project.ownerAvatar)} alt="" className="h-6 w-6 rounded-full" />
              {project.ownerName ?? "Autor"}
            </Link>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(project.addedAt).toLocaleDateString("pt-BR")}
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {project.votes} votos
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.tags.map((t) => (
                <span key={t} className="rounded-full border border-slate-800 bg-slate-900/50 px-2.5 py-0.5 text-[11px] font-bold text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="min-w-0 space-y-8">
          {embed && (
            <section className="overflow-hidden rounded-2xl border border-slate-900 bg-black">
              <iframe
                src={embed.src}
                title={`Player: ${project.title}`}
                className={cn("w-full", embed.kind === "youtube" ? "aspect-video" : embed.kind === "spotify" ? "h-[352px]" : "h-[300px]")}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </section>
          )}

          {project.screenshots.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Galeria</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {project.screenshots.map((src, i) => (
                  <button
                    key={`${i}-${src}`}
                    onClick={() => setLightbox(i)}
                    className="group overflow-hidden rounded-xl border border-slate-900 bg-zinc-950"
                  >
                    <img src={src} alt={`Screenshot ${i + 1}`} loading="lazy" className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Sobre</h2>
            <div className="rounded-2xl border border-slate-900 bg-zinc-950/60 p-6 text-sm leading-relaxed text-slate-300">
              {project.description ? <Markdown>{project.description}</Markdown> : <p className="text-slate-500">{project.summary}</p>}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-extrabold text-black transition-colors hover:bg-zinc-200"
          >
            <ExternalLink className="h-4 w-4" />
            {OPEN_LABEL[project.type]}
          </a>
          <p className="-mt-2 text-center text-[11px] font-semibold text-slate-500">{hostOf(project.url)}</p>

          {canVote && (
            <div className="space-y-3 rounded-2xl border border-slate-900 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Votos</span>
                <span className="flex items-center gap-1 text-lg font-black text-white">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {project.votes}
                </span>
              </div>
              {user ? (
                <>
                  {recaptchaSiteKey && !cooldownText && <ReCaptcha key={recaptchaSiteKey} siteKey={recaptchaSiteKey} onChange={setCaptchaToken} />}
                  <button
                    onClick={handleVote}
                    disabled={voting || !!cooldownText || (!!recaptchaSiteKey && !captchaToken)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-sm font-extrabold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cooldownText ? `Próximo voto em ${cooldownText}` : voting ? "Votando..." : "Votar 🔥"}
                  </button>
                  <p className="text-center text-[11px] text-slate-500">Votar em projetos rende unicoins. O cooldown é separado do voto em bots.</p>
                </>
              ) : (
                <button
                  onClick={startLogin}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-800 text-sm font-bold text-white hover:bg-slate-900"
                >
                  Faça login para votar
                </button>
              )}
            </div>
          )}

          {project.links.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-slate-900 bg-zinc-950/60 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Links</span>
              {project.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">{l.label}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-500">{hostOf(l.url)}</span>
                </a>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" />
              Copiar link
            </button>
            {isOwner && (
              <Link
                href={`/projects/${project.id}/edit`}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-800 px-3 text-xs font-bold text-slate-200 hover:bg-slate-900 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Link>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-500/30 px-3 text-xs font-bold text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10" aria-label="Fechar">
            <X className="h-6 w-6" />
          </button>
          {project.screenshots.length > 1 && (
            <>
              <button
                className="absolute left-4 rounded-full p-2 text-white hover:bg-white/10"
                aria-label="Anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox - 1 + project.screenshots.length) % project.screenshots.length);
                }}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                className="absolute right-4 rounded-full p-2 text-white hover:bg-white/10"
                aria-label="Próxima"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox + 1) % project.screenshots.length);
                }}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img src={project.screenshots[lightbox]} alt="" className="max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
