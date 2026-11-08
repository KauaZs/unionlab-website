"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trophy, Clock, Plus, Sparkles } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { PROJECT_TYPE_BY_ID } from "@/lib/projectTypes";
import { cn } from "@/lib/utils";
import type { Project, ProjectType } from "@/lib/types";
import { GridState, SortTabs, matchesSearch, normalize, type SortOption } from "./shared";

type ProjectSort = "popular" | "rated" | "recent";

const SORTS: SortOption<ProjectSort>[] = [
  { id: "popular", label: "Mais votados", icon: Trophy },
  { id: "rated", label: "Melhor avaliados", icon: Sparkles },
  { id: "recent", label: "Recentes", icon: Clock },
];

const MAX_TAG_CHIPS = 12;

interface ProjectsExplorerProps {
  type: ProjectType;
  /** All approved projects; filtered to `type` here. */
  projects: Project[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  search: string;
  onClearSearch: () => void;
}

export default function ProjectsExplorer({ type, projects, loading, error, onRetry, search, onClearSearch }: ProjectsExplorerProps) {
  const info = PROJECT_TYPE_BY_ID[type];
  const Icon = info.icon;
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<ProjectSort>("popular");

  const ofType = useMemo(() => projects.filter((p) => p.type === type), [projects, type]);

  const rankById = useMemo(() => {
    const map = new Map<string, number>();
    [...ofType]
      .filter((p) => p.votes > 0)
      .sort((a, b) => b.votes - a.votes)
      .forEach((p, i) => map.set(p.id, i + 1));
    return map;
  }, [ofType]);

  // Most used tags in this type (case/accent-insensitive), keeping the first spelling seen.
  const topTags = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const p of ofType)
      for (const t of p.tags) {
        const key = normalize(t);
        const entry = counts.get(key) ?? { label: t, count: 0 };
        entry.count++;
        counts.set(key, entry);
      }
    return [...counts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, MAX_TAG_CHIPS);
  }, [ofType]);

  const visible = useMemo(() => {
    const q = normalize(search);
    return ofType
      .filter((p) => (!tag || p.tags.some((t) => normalize(t) === tag)) && matchesSearch(q, [p.title, p.summary, p.ownerName, ...p.tags]))
      .sort((a, b) => {
        if (sort === "popular") return b.votes - a.votes;
        if (sort === "rated") return (b.rating || 0) - (a.rating || 0) || (b.feedbackCount || 0) - (a.feedbackCount || 0);
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }, [ofType, search, tag, sort]);

  return (
    <div className="space-y-8">
      {/* Intro + publish CTA */}
      <section
        className="relative overflow-hidden rounded-3xl border border-slate-900 p-6 md:p-8"
        style={{ background: `linear-gradient(120deg, ${info.gradient[0]}55 0%, transparent 60%)` }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", info.bg, info.border)}>
              <Icon className={cn("h-6 w-6", info.text)} />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white">{info.plural} da comunidade</h2>
              <p className="text-sm font-medium text-slate-400">
                {ofType.length} {ofType.length === 1 ? "projeto publicado" : "projetos publicados"} • vote nos seus favoritos e ganhe unicoins
              </p>
            </div>
          </div>
          <Link
            href={`/projects/new?type=${type}`}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-xs font-extrabold text-black transition-colors hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Publicar {info.label.toLowerCase()}
          </Link>
        </div>
      </section>

      {/* Tags */}
      {topTags.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            onClick={() => setTag(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
              tag === null ? "border-white bg-white text-black" : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
            )}
          >
            Todos
          </button>
          {topTags.map(([key, { label, count }]) => (
            <button
              key={key}
              onClick={() => setTag(tag === key ? null : key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                tag === key ? cn(info.bg, info.border, info.text) : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
              )}
            >
              {label}
              <span className="text-[10px] text-slate-500">{count}</span>
            </button>
          ))}
        </div>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-900 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white">{search ? "Resultados da pesquisa" : `Explorar ${info.plural.toLowerCase()}`}</h2>
            <p className="text-xs font-semibold text-slate-500">{visible.length} encontrados</p>
          </div>
          <SortTabs options={SORTS} value={sort} onChange={setSort} />
        </div>

        <GridState
          loading={loading}
          error={error}
          onRetry={onRetry}
          isEmpty={visible.length === 0}
          skeletonHeight={330}
          emptyMessage={
            search || tag
              ? "Nenhum projeto encontrado com esses filtros."
              : `Ainda não há ${info.plural.toLowerCase()} publicados. Seja o primeiro!`
          }
          onClearFilters={
            search || tag
              ? () => {
                  onClearSearch();
                  setTag(null);
                }
              : undefined
          }
        >
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} rank={rankById.get(p.id)} />
          ))}
        </GridState>
      </section>
    </div>
  );
}
