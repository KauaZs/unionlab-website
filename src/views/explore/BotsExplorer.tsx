"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trophy, Sparkles, Clock, LayoutGrid, ArrowRight } from "lucide-react";
import BotCard, { botAvatarUrl, isNewBot } from "@/components/BotCard";
import OutdoorSpotlight, { type ActiveOutdoor } from "@/components/OutdoorSpotlight";
import { CATEGORIES, categoriesOf } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Bot } from "@/lib/types";
import { GridState, SectionTitle, SortTabs, matchesSearch, normalize, type SortOption } from "./shared";

type BotSort = "popular" | "rated" | "recent";

const SORTS: SortOption<BotSort>[] = [
  { id: "popular", label: "Mais votados", icon: Trophy },
  { id: "rated", label: "Melhor avaliados", icon: Sparkles },
  { id: "recent", label: "Recém adicionados", icon: Clock },
];

function addedTime(bot: Bot) {
  // Fall back to the Discord snowflake (account creation) when the API has no listing date.
  if (bot.addedAt) return new Date(bot.addedAt).getTime();
  return Number(BigInt(bot.id) / BigInt(4194304)) + 1420070400000;
}

interface BotsExplorerProps {
  bots: Bot[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  search: string;
  onClearSearch: () => void;
  outdoor: ActiveOutdoor | null;
}

export default function BotsExplorer({ bots, loading, error, onRetry, search, onClearSearch, outdoor }: BotsExplorerProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<BotSort>("popular");

  // Global position by votes, used for the #1–#3 medals regardless of filters.
  const rankById = useMemo(() => {
    const map = new Map<string, number>();
    [...bots]
      .filter((b) => b.votes > 0)
      .sort((a, b) => b.votes - a.votes)
      .forEach((b, i) => map.set(b.id, i + 1));
    return map;
  }, [bots]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bots) for (const c of categoriesOf(b.tags)) counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    return counts;
  }, [bots]);

  const recentBots = useMemo(() => [...bots].sort((a, b) => addedTime(b) - addedTime(a)).slice(0, 6), [bots]);

  const visibleBots = useMemo(() => {
    const q = normalize(search);
    return bots
      .filter((bot) => {
        if (category && !categoriesOf(bot.tags).some((c) => c.id === category)) return false;
        return matchesSearch(q, [bot.username, bot.description, bot.language, ...(bot.tags ?? [])]);
      })
      .sort((a, b) => {
        if (sort === "popular") return b.votes - a.votes;
        if (sort === "rated") return (b.rating || 0) - (a.rating || 0) || (b.feedbackCount || 0) - (a.feedbackCount || 0);
        return addedTime(b) - addedTime(a);
      });
  }, [bots, search, category, sort]);

  const activeCategory = CATEGORIES.find((c) => c.id === category) ?? null;
  const isBrowsing = !category && !search;

  return (
    <div className="space-y-12">
      {/* Categories */}
      <section className="space-y-4">
        <SectionTitle>Categorias</SectionTitle>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-10">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              "flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 text-center transition-all duration-200 sm:w-auto",
              category === null
                ? "border-white/30 bg-white text-black"
                : "border-slate-900 bg-zinc-950/60 text-slate-300 hover:border-slate-700 hover:text-white"
            )}
          >
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", category === null ? "bg-black/10" : "bg-white/5")}>
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="text-xs font-extrabold">Todos</span>
            <span className={cn("text-[10px] font-bold", category === null ? "text-zinc-600" : "text-slate-500")}>{bots.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = categoryCounts.get(c.id) ?? 0;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(active ? null : c.id)}
                disabled={count === 0}
                className={cn(
                  "flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 text-center transition-all duration-200 sm:w-auto",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  active
                    ? cn(c.bg, c.border, "ring-1 ring-inset ring-current", c.text)
                    : "border-slate-900 bg-zinc-950/60 text-slate-300 enabled:hover:border-slate-700 enabled:hover:text-white"
                )}
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", c.bg)}>
                  <Icon className={cn("h-4 w-4", c.text)} />
                </span>
                <span className="text-xs font-extrabold">{c.label}</span>
                <span className="text-[10px] font-bold text-slate-500">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* New arrivals strip (only when not filtering) */}
      {isBrowsing && !loading && recentBots.length > 0 && (
        <section className="space-y-4">
          <SectionTitle
            action={
              <button onClick={() => setSort("recent")} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-white">
                Ver todos <ArrowRight className="h-3 w-3" />
              </button>
            }
          >
            Novos na Union Lab
          </SectionTitle>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
            {recentBots.map((bot) => {
              const cat = categoriesOf(bot.tags)[0];
              return (
                <Link
                  key={bot.id}
                  href={`/bot/${bot.id}`}
                  className="flex w-44 shrink-0 items-center gap-3 rounded-2xl border border-slate-900 bg-zinc-950/60 p-3 transition-colors hover:border-slate-700 sm:w-auto"
                >
                  <img src={botAvatarUrl(bot.id, bot.avatar)} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{bot.username}</p>
                    <p className={cn("truncate text-[11px] font-semibold", cat ? cat.text : "text-slate-500")}>
                      {isNewBot(bot) ? "Novo • " : ""}
                      {cat ? cat.label : bot.language}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {outdoor && isBrowsing && <OutdoorSpotlight outdoor={outdoor} />}

      {/* Bot grid */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-900 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {activeCategory ? (
              <>
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", activeCategory.bg)}>
                  <activeCategory.icon className={cn("h-5 w-5", activeCategory.text)} />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Bots de {activeCategory.label}</h2>
                  <p className="text-xs font-semibold text-slate-500">{visibleBots.length} encontrados</p>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-lg font-extrabold text-white">{search ? "Resultados da pesquisa" : "Explorar bots"}</h2>
                <p className="text-xs font-semibold text-slate-500">{visibleBots.length} bots</p>
              </div>
            )}
          </div>
          <SortTabs options={SORTS} value={sort} onChange={setSort} />
        </div>

        <GridState
          loading={loading}
          error={error}
          onRetry={onRetry}
          isEmpty={visibleBots.length === 0}
          emptyMessage={search || category ? "Nenhum bot encontrado com esses filtros." : "Nenhum bot cadastrado ainda."}
          onClearFilters={
            search || category
              ? () => {
                  onClearSearch();
                  setCategory(null);
                }
              : undefined
          }
        >
          {visibleBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} rank={rankById.get(bot.id)} />
          ))}
        </GridState>
      </section>
    </div>
  );
}
