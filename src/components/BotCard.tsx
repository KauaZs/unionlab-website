import Link from "next/link";
import { Flame, Plus, Star } from "lucide-react";
import type { Bot } from "@/lib/types";
import { categoriesOf } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { isRecent } from "@/lib/dates";

export function botAvatarUrl(id: string, avatar: string | null) {
  if (avatar) return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`;
  // Same rule Discord uses for default avatars: (id >> 22) % 6.
  let index = 0;
  try {
    index = Number((BigInt(id) / BigInt(4194304)) % BigInt(6));
  } catch {
    /* non-numeric id: keep the first default avatar */
  }
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function botInviteUrl(id: string) {
  return `https://discord.com/oauth2/authorize?client_id=${id}&permissions=0&scope=bot%20applications.commands`;
}

export function isNewBot(bot: Bot) {
  return isRecent(bot.addedAt);
}

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-400 text-black shadow-amber-500/30",
  2: "bg-zinc-200 text-black shadow-white/10",
  3: "bg-orange-700 text-white shadow-orange-700/30",
};

interface BotCardProps {
  bot: Bot;
  /** Global position by votes (1-based); top 3 get a medal. */
  rank?: number;
}

export default function BotCard({ bot, rank }: BotCardProps) {
  const categories = categoriesOf(bot.tags);
  const extraTags = (bot.tags ?? []).length - categories.length;
  const hasRating = !!bot.rating && !!bot.feedbackCount;
  const medal = rank && rank <= 3 ? rank : null;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-zinc-950/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50",
        medal === 1 ? "border-amber-500/30 hover:border-amber-500/50" : "border-slate-900 hover:border-slate-700"
      )}
    >
      {/* Whole card is a link stacked above the (positioned) content; inner actions sit above it with z-10. */}
      <Link
        href={`/bot/${bot.id}`}
        aria-label={`Ver perfil de ${bot.username}`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      />

      {/* Banner: the bot's own avatar, blown up and blurred, so the colors always match it */}
      <div className="relative h-20 shrink-0 overflow-hidden bg-zinc-900">
        <img
          src={botAvatarUrl(bot.id, bot.avatar)}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-150 object-cover opacity-80 blur-2xl saturate-150 transition-transform duration-500 group-hover:scale-[1.7]"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent" />
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {isNewBot(bot) && (
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

      <div className="relative flex flex-1 flex-col px-5 pb-4">
        {/* Avatar overlaps the banner; name sits below it */}
        <div className="-mt-8">
          <img
            src={botAvatarUrl(bot.id, bot.avatar)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl border-4 border-zinc-950 bg-zinc-900 object-cover shadow-xl transition-transform duration-300 group-hover:scale-105"
          />
          <div className="mt-2 min-w-0">
            <h3 className="truncate text-base font-extrabold leading-tight text-white">{bot.username}</h3>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span>{bot.language}</span>
              {hasRating && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {bot.rating!.toFixed(1)}
                    <span className="font-medium text-slate-500">({bot.feedbackCount})</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-[13px] leading-5 text-slate-400">
          {bot.description || "Sem descrição."}
        </p>

        {/* Categories */}
        {(categories.length > 0 || extraTags > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.slice(0, 3).map((c) => {
              const Icon = c.icon;
              return (
                <span key={c.id} className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", c.text, c.bg, c.border)}>
                  <Icon className="h-3 w-3" />
                  {c.label}
                </span>
              );
            })}
            {categories.length > 3 || extraTags > 0 ? (
              <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                +{Math.max(0, categories.length - 3) + Math.max(0, extraTags)}
              </span>
            ) : null}
          </div>
        )}

        <div className="h-4" />
        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-900 pt-3.5">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1" title="Votos">
              <Flame className="h-3.5 w-3.5 fill-orange-500/20 text-orange-500" />
              {bot.votes}
            </span>
            <code className="rounded border border-slate-800 bg-slate-900/60 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300" title="Prefixo">
              {bot.prefix}
            </code>
          </div>
          <a
            href={botInviteUrl(bot.id)}
            target="_blank"
            rel="noreferrer"
            className="relative z-10 flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-[11px] font-extrabold text-black transition-colors hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </a>
        </div>
      </div>
    </article>
  );
}
