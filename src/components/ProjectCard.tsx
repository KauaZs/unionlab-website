import Link from "next/link";
import { Flame, ExternalLink, Star } from "lucide-react";
import type { Project } from "@/lib/types";
import { PROJECT_TYPE_BY_ID, hostOf, projectGradient } from "@/lib/projectTypes";
import { isRecent } from "@/lib/dates";
import { cn } from "@/lib/utils";
import SupporterBadge from "./SupporterBadge";

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-400 text-black",
  2: "bg-zinc-200 text-black",
  3: "bg-orange-700 text-white",
};

export function userAvatarUrl(id: string, avatar: string | null) {
  return avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=64` : "https://cdn.discordapp.com/embed/avatars/0.png";
}

interface ProjectCardProps {
  project: Project;
  /** Position by votes within its type (1-based). */
  rank?: number;
}

export default function ProjectCard({ project, rank }: ProjectCardProps) {
  const type = PROJECT_TYPE_BY_ID[project.type];
  const TypeIcon = type.icon;
  const medal = rank && rank <= 3 ? rank : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-900 bg-zinc-950/80 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl hover:shadow-black/50">
      <Link
        href={`/projects/${project.id}`}
        aria-label={`Ver ${project.title}`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      />

      {/* Cover */}
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden" style={{ background: projectGradient(project.type) }}>
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TypeIcon className={cn("h-12 w-12 opacity-60", type.text)} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950/90 to-transparent" />
        <span
          className={cn(
            "absolute left-3 top-3 flex items-center gap-1 rounded-full border bg-zinc-950/70 px-2 py-0.5 text-[10px] font-bold backdrop-blur",
            type.text,
            type.border
          )}
        >
          <TypeIcon className="h-3 w-3" />
          {type.label}
        </span>
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {isRecent(project.addedAt) && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 backdrop-blur">
              Novo
            </span>
          )}
          {medal && (
            <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-lg", RANK_STYLES[medal])}>
              #{medal}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-3">
        <h3 className="truncate text-base font-extrabold text-white">{project.title}</h3>
        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] leading-5 text-slate-400">{project.summary}</p>

        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                {t}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="h-4" />
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-900 pt-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <img src={userAvatarUrl(project.ownerId, project.ownerAvatar)} alt="" className="h-6 w-6 shrink-0 rounded-full" />
            <span className="truncate text-xs font-semibold text-slate-400">{project.ownerName ?? "Autor"}</span>
            {project.ownerIsSupporter && <SupporterBadge />}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {!!project.feedbackCount && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400" title={`${project.feedbackCount} avaliações`}>
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {project.rating!.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-bold text-slate-300" title="Votos">
              <Flame className="h-3.5 w-3.5 fill-orange-500/20 text-orange-500" />
              {project.votes}
            </span>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title={hostOf(project.url)}
              className="relative z-10 flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-[11px] font-extrabold text-black transition-colors hover:bg-zinc-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
