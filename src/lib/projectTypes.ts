import { Globe, Gamepad2, Music, Shapes, Bot, type LucideIcon } from "lucide-react";
import type { ProjectType } from "./types";

export interface ProjectTypeInfo {
  id: ProjectType;
  /** Singular, e.g. on a badge. */
  label: string;
  /** Plural, for tabs and headings. */
  plural: string;
  icon: LucideIcon;
  text: string;
  bg: string;
  border: string;
  gradient: [string, string];
  /** What the main link is, shown on the submit form. */
  urlLabel: string;
  urlPlaceholder: string;
  suggestedTags: string[];
}

export const PROJECT_TYPES: ProjectTypeInfo[] = [
  {
    id: "website", label: "Website", plural: "Sites", icon: Globe,
    text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", gradient: ["#0c4a6e", "#082f49"],
    urlLabel: "Link do site", urlPlaceholder: "https://meusite.com",
    suggestedTags: ["Portfólio", "Landing Page", "Dashboard", "E-commerce", "Blog", "Ferramenta", "Open Source"],
  },
  {
    id: "game", label: "Jogo", plural: "Jogos", icon: Gamepad2,
    text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", gradient: ["#064e3b", "#022c22"],
    urlLabel: "Link para jogar", urlPlaceholder: "https://itch.io/... ou https://roblox.com/games/...",
    suggestedTags: ["Roblox", "Minecraft", "Navegador", "Mobile", "PC", "Multiplayer", "Indie", "Game Jam"],
  },
  {
    id: "music", label: "Música", plural: "Músicas", icon: Music,
    text: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/25", gradient: ["#701a75", "#3b0764"],
    urlLabel: "Link da música", urlPlaceholder: "https://open.spotify.com/... ou https://youtube.com/...",
    suggestedTags: ["Trap", "Funk", "Lo-fi", "Eletrônica", "Rock", "Rap", "Beat", "Instrumental"],
  },
  {
    id: "other", label: "Outro", plural: "Outros", icon: Shapes,
    text: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/25", gradient: ["#27272a", "#18181b"],
    urlLabel: "Link do projeto", urlPlaceholder: "https://...",
    suggestedTags: ["Biblioteca", "API", "Extensão", "App", "Design", "Arte", "Vídeo"],
  },
];

export const PROJECT_TYPE_BY_ID = Object.fromEntries(PROJECT_TYPES.map((t) => [t.id, t])) as Record<ProjectType, ProjectTypeInfo>;

/** Bots are not a project type, but share the explore tabs. */
export const BOT_TAB = { id: "bots" as const, plural: "Bots", icon: Bot };

export function projectGradient(type: ProjectType) {
  const [from, to] = PROJECT_TYPE_BY_ID[type].gradient;
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

/** Turns a Spotify / YouTube / SoundCloud link into an embeddable player URL. */
export function embedUrlFor(url: string): { src: string; kind: "spotify" | "youtube" | "soundcloud" } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");

  if (host === "open.spotify.com") {
    const m = u.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
    if (m) return { kind: "spotify", src: `https://open.spotify.com/embed/${m[1]}/${m[2]}` };
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const id = u.searchParams.get("v");
    if (id && /^[\w-]{11}$/.test(id)) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    if (/^[\w-]{11}$/.test(id)) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === "soundcloud.com") {
    return {
      kind: "soundcloud",
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d946ef&visual=true`,
    };
  }
  return null;
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export type ExploreTab = "bots" | ProjectType;

/** URL slug (Portuguese) <-> explore tab, used as /?tab=jogos. */
export const TAB_SLUGS: Record<ExploreTab, string> = {
  bots: "bots",
  website: "sites",
  game: "jogos",
  music: "musicas",
  other: "outros",
};

export function tabFromSlug(slug: string | undefined): ExploreTab {
  const found = (Object.entries(TAB_SLUGS) as [ExploreTab, string][]).find(([, s]) => s === slug);
  return found ? found[0] : "bots";
}
