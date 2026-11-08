"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Pencil, Flame, Clock, CheckCircle2, XCircle } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { PROJECT_TYPE_BY_ID, projectGradient } from "@/lib/projectTypes";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";
import DeleteProjectButton from "@/components/DeleteProjectButton";

const STATUS = {
  pending: { label: "Em análise", icon: Clock, className: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  approved: { label: "Publicado", icon: CheckCircle2, className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
  refused: { label: "Recusado", icon: XCircle, className: "border-red-500/25 bg-red-500/10 text-red-300" },
} as const;

type ProfileProjectsProps =
  /** The logged-in user's own profile: every status, with edit actions. */
  | { mode: "own"; authToken: string; ownerName?: never; ownerId?: never }
  /** Someone's public profile: approved projects only. */
  | { mode: "public"; ownerId: string; ownerName: string; authToken?: never };

export default function ProfileProjects(props: ProfileProjectsProps) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState(false);
  const own = props.mode === "own";
  const url = own ? "/api/public/projects/mine" : `/api/public/projects?owner=${props.ownerId}`;
  const token = own ? props.authToken : null;

  useEffect(() => {
    fetchJson<Project[]>(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then(setProjects)
      .catch(() => setError(true));
  }, [url, token]);

  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950/10">
      <div className="flex items-start justify-between gap-3 p-6">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-fuchsia-400" />
            <h3 className="text-base font-bold text-slate-200">{own ? "Meus Projetos" : `Projetos de ${props.ownerName}`}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {own ? "Sites, jogos e músicas que você publicou, inclusive os que estão em análise." : "Sites, jogos e músicas publicados por este usuário."}
          </p>
        </div>
        {own && (
          <Link
            href="/projects/new"
            className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-white px-3 text-[11px] font-extrabold text-black hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Publicar
          </Link>
        )}
      </div>

      <div className="space-y-3 px-6 pb-6">
        {error ? (
          <p className="py-6 text-center text-sm font-medium text-slate-500">Não foi possível carregar os projetos.</p>
        ) : projects === null ? (
          <span className="text-xs font-semibold text-slate-500">Carregando...</span>
        ) : projects.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-slate-500">
            {own ? "Você ainda não publicou nenhum projeto." : "Este usuário ainda não publicou projetos."}
          </p>
        ) : (
          projects.map((p) => {
            const type = PROJECT_TYPE_BY_ID[p.type];
            const TypeIcon = type.icon;
            const status = STATUS[p.status];
            const StatusIcon = status.icon;
            return (
              <div key={p.id} className="rounded-xl border border-slate-900 bg-slate-950/20 transition-colors hover:border-slate-800">
                <div className="flex items-center gap-3.5 p-3">
                  <Link href={`/projects/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
                    <div
                      className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                      style={{ background: projectGradient(p.type) }}
                    >
                      {p.coverImage ? (
                        <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <TypeIcon className={cn("h-6 w-6 opacity-60", type.text)} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-200">{p.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                        <span className={cn("flex items-center gap-1", type.text)}>
                          <TypeIcon className="h-3 w-3" />
                          {type.label}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {p.votes} votos
                        </span>
                        {own && (
                          <span className={cn("flex items-center gap-1 rounded-full border px-1.5 py-0.5", status.className)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  {own && (
                    <Link
                      href={`/projects/${p.id}/edit`}
                      className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-800 px-2.5 text-[11px] font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                      <Pencil className="h-3 w-3" />
                      {p.status === "refused" ? "Corrigir" : "Editar"}
                    </Link>
                  )}
                  {own && (
                    <DeleteProjectButton
                      compact
                      projectId={p.id}
                      projectTitle={p.title}
                      onDeleted={() => setProjects((list) => (list ?? []).filter((x) => x.id !== p.id))}
                    />
                  )}
                </div>
                {own && p.status === "refused" && p.refusedReason && (
                  <p className="border-t border-slate-900 px-3 py-2 text-[11px] font-medium text-red-300/90">Motivo: {p.refusedReason}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
