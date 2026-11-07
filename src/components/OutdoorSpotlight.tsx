import Link from "next/link";
import { ExternalLink, Megaphone } from "lucide-react";
import { botAvatarUrl, botInviteUrl } from "./BotCard";

export interface ActiveOutdoor {
  active: boolean;
  botId: string;
  username: string;
  avatar: string | null;
  description: string;
  language: string;
  prefix: string;
  hexColor?: string;
}

export default function OutdoorSpotlight({ outdoor }: { outdoor: ActiveOutdoor }) {
  const color = outdoor.hexColor || "#FFC800";

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-slate-900 bg-zinc-950/60 p-6 shadow-2xl"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div
        className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: color }}
      />
      <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-5 md:flex-row">
          <img
            src={botAvatarUrl(outdoor.botId, outdoor.avatar)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl border border-slate-900 object-cover shadow-lg"
          />
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="text-base font-black text-white">{outdoor.username}</span>
              <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                <Megaphone className="h-3 w-3" />
                Destaque do Dia
              </span>
            </div>
            <p className="max-w-xl text-xs font-semibold leading-relaxed text-slate-400">{outdoor.description}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] font-bold text-slate-400 md:justify-start">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5">{outdoor.language}</span>
              <code className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono">{outdoor.prefix}</code>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-row items-center justify-center gap-3 md:w-auto md:flex-col md:items-end">
          <a
            href={botInviteUrl(outdoor.botId)}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-1/2 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-black shadow-md transition-colors hover:bg-zinc-200 md:w-40"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Adicionar Bot
          </a>
          <Link
            href={`/bot/${outdoor.botId}`}
            className="flex h-9 w-1/2 items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-xs font-bold text-slate-200 transition-colors hover:bg-zinc-800 hover:text-white md:w-40"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </section>
  );
}
