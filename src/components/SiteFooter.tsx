import Link from "next/link";
import DiscordIcon from "./DiscordIcon";
import { DISCORD_INVITE_URL } from "@/lib/site";

const LINKS = [
  { href: "/rankings", label: "Rankings" },
  { href: "/store", label: "Loja" },
  { href: "/vip", label: "VIP" },
  { href: "/codes", label: "Codes" },
  { href: "/help", label: "Ajuda & FAQ" },
];

export default function SiteFooter() {
  return (
    <div className="relative z-10 mx-auto mt-8 w-full max-w-[1400px] px-[5%] pb-10">
      <section className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-[#5865F2]/25 bg-[#5865F2]/10 p-6 text-center md:flex-row md:p-8 md:text-left">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white">
            <DiscordIcon className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-white">Faça parte da comunidade</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-400">Entre no servidor da Union Lab no Discord.</p>
          </div>
        </div>
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#5865F2] px-6 text-sm font-extrabold text-white transition-colors hover:bg-[#4752C4]"
        >
          <DiscordIcon className="h-5 w-5" />
          Entrar no Discord
        </a>
      </section>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs font-semibold text-slate-500 sm:flex-row">
        <span>Union Lab</span>
        <nav aria-label="Links do rodapé" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
