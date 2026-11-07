import {
  Shield,
  Music,
  PartyPopper,
  Coins,
  Wrench,
  Sparkles,
  Swords,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Tag spellings (normalized: lowercase, no accents) that map to this category. */
  aliases: string[];
  /** Full Tailwind class strings, so the compiler keeps them. */
  text: string;
  bg: string;
  border: string;
  /** Two hex stops for the card banner gradient. */
  gradient: [string, string];
}

// Same set as the "Tags Sugeridas" in the bot editor (minus "Outro").
export const CATEGORIES: Category[] = [
  {
    id: "moderacao", label: "Moderação", icon: Shield,
    aliases: ["moderacao", "moderation", "mod", "automod", "seguranca", "security"],
    text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25",
    gradient: ["#0c4a6e", "#082f49"],
  },
  {
    id: "musica", label: "Música", icon: Music,
    aliases: ["musica", "music", "radio", "som"],
    text: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/25",
    gradient: ["#701a75", "#3b0764"],
  },
  {
    id: "diversao", label: "Diversão", icon: PartyPopper,
    aliases: ["diversao", "fun", "jogos", "games", "minigames", "memes"],
    text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25",
    gradient: ["#7c2d12", "#431407"],
  },
  {
    id: "economia", label: "Economia", icon: Coins,
    aliases: ["economia", "economy", "money", "dinheiro"],
    text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25",
    gradient: ["#78350f", "#451a03"],
  },
  {
    id: "utilidades", label: "Utilidades", icon: Wrench,
    aliases: ["utilidades", "utilidade", "utility", "utilities", "util", "ferramentas", "tools"],
    text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25",
    gradient: ["#064e3b", "#022c22"],
  },
  {
    id: "anime", label: "Anime", icon: Sparkles,
    aliases: ["anime", "animes", "manga", "otaku"],
    text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/25",
    gradient: ["#831843", "#500724"],
  },
  {
    id: "rpg", label: "RPG", icon: Swords,
    aliases: ["rpg", "aventura", "adventure"],
    text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25",
    gradient: ["#7f1d1d", "#450a0a"],
  },
  {
    id: "ticket", label: "Ticket", icon: Ticket,
    aliases: ["ticket", "tickets", "suporte", "support", "atendimento"],
    text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25",
    gradient: ["#312e81", "#1e1b4b"],
  },
  {
    id: "social", label: "Social", icon: Users,
    aliases: ["social", "comunidade", "community", "niveis", "levels", "xp"],
    text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/25",
    gradient: ["#134e4a", "#042f2e"],
  },
];

export function normalizeTag(tag: string) {
  return tag.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

const byAlias = new Map<string, Category>();
for (const c of CATEGORIES) for (const a of c.aliases) byAlias.set(a, c);

export function categoryForTag(tag: string): Category | undefined {
  return byAlias.get(normalizeTag(tag));
}

/** Distinct categories a bot belongs to, in tag order. */
export function categoriesOf(tags: string[] | undefined): Category[] {
  const seen = new Set<string>();
  const out: Category[] = [];
  for (const t of tags ?? []) {
    const c = categoryForTag(t);
    if (c && !seen.has(c.id)) {
      seen.add(c.id);
      out.push(c);
    }
  }
  return out;
}
