"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Search, Bot, Users, Flame, X, Plus } from "lucide-react";
import EventBanner from "../components/EventBanner";
import type { ActiveOutdoor } from "../components/OutdoorSpotlight";
import { Input } from "../components/ui/input";
import BotsExplorer from "./explore/BotsExplorer";
import ProjectsExplorer from "./explore/ProjectsExplorer";
import { fetchJson } from "@/lib/api";
import { BOT_TAB, PROJECT_TYPES, TAB_SLUGS, type ExploreTab } from "@/lib/projectTypes";
import { cn } from "@/lib/utils";
import type { Bot as BotData, EventData, Project, ProjectType } from "@/lib/types";

interface HomeProps {
  /** Data rendered on the server; null when the server couldn't reach the API. */
  initialBots: BotData[] | null;
  initialProjects: Project[] | null;
  initialEvent: EventData | null;
  initialTab: ExploreTab;
}

interface GlobalStats {
  totalBots: number;
  totalUsers: number;
  totalVotes: number;
}

/** Fetches a list on the client only when the server didn't provide it. */
function useList<T>(url: string, initial: T[] | null) {
  const [items, setItems] = useState<T[]>(initial ?? []);
  const [loading, setLoading] = useState(initial === null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    fetchJson<T[]>(url)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(`Error loading ${url}:`, err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    if (initial === null) load();
  }, [initial, load]);

  const retry = () => {
    setLoading(true);
    setError(false);
    load();
  };

  return { items, loading, error, retry };
}

const formatNumber = (n: number) => n.toLocaleString("pt-BR");

export default function Home({ initialBots, initialProjects, initialEvent, initialTab }: HomeProps) {
  const bots = useList<BotData>("/api/public/bots", initialBots);
  const projects = useList<Project>("/api/public/projects", initialProjects);
  const [tab, setTab] = useState<ExploreTab>(initialTab);
  const [search, setSearch] = useState("");
  const [activeEvent, setActiveEvent] = useState<EventData | null>(initialEvent);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [activeOutdoor, setActiveOutdoor] = useState<ActiveOutdoor | null>(null);

  useEffect(() => {
    if (initialEvent === null) {
      fetchJson<EventData>("/api/public/event")
        .then(setActiveEvent)
        .catch((err) => console.error("Error loading event:", err));
    }
    fetchJson<GlobalStats>("/api/public/stats")
      .then(setStats)
      .catch((err) => console.error("Error loading stats:", err));
    fetchJson<ActiveOutdoor>("/api/public/outdoor/active")
      .then((data) => {
        if (data.active) setActiveOutdoor(data);
      })
      .catch((err) => console.error("Error loading active outdoor:", err));
  }, [initialEvent]);

  // Keep the active tab visible in the horizontally scrolling bar (mobile), without scrolling the page.
  const tabsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = tabsRef.current;
    const el = nav?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
    if (!nav || !el) return;
    const left = el.offsetLeft - nav.offsetLeft;
    if (left < nav.scrollLeft || left + el.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: left - 8, behavior: "smooth" });
    }
  }, [tab]);

  const selectTab = (next: ExploreTab) => {
    setTab(next);
    // Keep the tab shareable without a server round-trip.
    const url = next === "bots" ? "/" : `/?tab=${TAB_SLUGS[next]}`;
    window.history.replaceState(null, "", url);
  };

  const projectCounts = useMemo(() => {
    const counts: Partial<Record<ProjectType, number>> = {};
    for (const p of projects.items) counts[p.type] = (counts[p.type] ?? 0) + 1;
    return counts;
  }, [projects.items]);

  const tabs = [
    { id: "bots" as ExploreTab, label: BOT_TAB.plural, unit: ["bot", "bots"], icon: BOT_TAB.icon, count: bots.items.length, text: BOT_TAB.text, bg: BOT_TAB.bg, accent: BOT_TAB.accent },
    ...PROJECT_TYPES.map((t) => ({
      id: t.id as ExploreTab,
      label: t.plural,
      unit: ["projeto", "projetos"],
      icon: t.icon,
      count: projectCounts[t.id] ?? 0,
      text: t.text,
      bg: t.bg,
      accent: t.accent,
    })),
  ];

  const searchPlaceholder =
    tab === "bots" ? "Pesquise bots por nome, categoria, linguagem..." : `Pesquise ${PROJECT_TYPES.find((t) => t.id === tab)!.plural.toLowerCase()} por nome, tag, autor...`;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="mx-auto flex max-w-2xl flex-col items-center space-y-6 py-8 text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
          Descubra o que a <br />
          <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">comunidade está criando.</span>
        </h1>
        <p className="text-base font-medium leading-relaxed text-slate-400 md:text-lg">
          Bots, sites, jogos e músicas feitos por desenvolvedores e artistas da Union Lab. Apoie seus favoritos e ganhe unicoins votando!
        </p>

        <div className="group relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-zinc-300" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="h-12 pl-11 pr-10 shadow-lg shadow-black/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Limpar pesquisa"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {stats && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-zinc-400" />
              <strong className="font-black text-white">{formatNumber(stats.totalBots)}</strong> bots
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              <strong className="font-black text-white">{formatNumber(stats.totalUsers)}</strong> usuários
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <strong className="font-black text-white">{formatNumber(stats.totalVotes)}</strong> votos
            </span>
          </div>
        )}
      </section>

      {activeEvent?.active && (
        <EventBanner name={activeEvent.name} multiplier={activeEvent.multiplier} eventKey={activeEvent.key} progress={activeEvent.progress} />
      )}

      {/* Explore tabs: segmented control, active tab takes its type's color */}
      <div className="sticky top-20 z-30 -mx-4 bg-[#050507]/80 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
        <div className="flex items-stretch gap-3">
          <nav
            ref={tabsRef}
            aria-label="Tipos de projeto"
            className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-2xl border border-slate-900 bg-zinc-950/70 p-1.5 shadow-xl shadow-black/30 [scrollbar-width:none]"
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  data-tab={t.id}
                  onClick={() => selectTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  style={active ? { borderColor: `${t.accent}55`, boxShadow: `inset 0 0 24px -12px ${t.accent}` } : undefined}
                  className={cn(
                    "group relative flex min-w-[124px] flex-1 items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                    active ? "bg-white/[0.04]" : "border-transparent hover:bg-white/[0.03]"
                  )}
                >
                  <span
                    className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors", t.bg)}
                    style={active ? { backgroundColor: t.accent } : undefined}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", active ? "text-black" : t.text)} />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block truncate text-sm font-extrabold leading-tight", active ? "text-white" : "text-slate-300 group-hover:text-white")}>
                      {t.label}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-500">
                      {t.count} {t.count === 1 ? t.unit[0] : t.unit[1]}
                    </span>
                  </span>
                  {active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full" style={{ backgroundColor: t.accent }} />}
                </button>
              );
            })}
          </nav>
          <Link
            href={tab === "bots" ? "/addbot" : `/projects/new?type=${tab}`}
            className="hidden shrink-0 items-center gap-1.5 rounded-2xl bg-white px-5 text-sm font-extrabold text-black shadow-xl shadow-black/30 transition-colors hover:bg-zinc-200 md:flex"
          >
            <Plus className="h-4 w-4" />
            Publicar
          </Link>
        </div>
      </div>

      {tab === "bots" ? (
        <BotsExplorer
          bots={bots.items}
          loading={bots.loading}
          error={bots.error}
          onRetry={bots.retry}
          search={search}
          onClearSearch={() => setSearch("")}
          outdoor={activeOutdoor}
        />
      ) : (
        <ProjectsExplorer
          key={tab}
          type={tab}
          projects={projects.items}
          loading={projects.loading}
          error={projects.error}
          onRetry={projects.retry}
          search={search}
          onClearSearch={() => setSearch("")}
        />
      )}
    </div>
  );
}
