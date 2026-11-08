"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Heart, Plus } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { userAvatarUrl } from "./ProjectCard";

interface Supporter {
  id: string;
  username: string;
  avatar: string | null;
  since: string;
}

/** Below this many supporters, a "be the next one" tile fills out the wall. */
const INVITE_BELOW = 8;

const sinceLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "").replace(" de ", "/");

export default function SupportersWall() {
  const [supporters, setSupporters] = useState<Supporter[] | null>(null);

  useEffect(() => {
    fetchJson<Supporter[]>("/api/public/supporters")
      .then((data) => setSupporters(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading supporters:", err));
  }, []);

  // Nice-to-have section: if it fails to load, the VIP page simply doesn't show it.
  if (supporters === null) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.07] to-transparent p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-200 to-blue-400">
          <Crown className="h-5 w-5 text-blue-950" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-white">Apoiadores UNION+</h2>
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
            Obrigado por manter a Union Lab no ar
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {supporters.map((s) => (
          <Link
            key={s.id}
            href={`/user/${s.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-blue-500/15 bg-zinc-950/60 p-3 transition-colors hover:border-blue-400/40"
          >
            <img src={userAvatarUrl(s.id, s.avatar)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-blue-400/70" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-100 group-hover:text-white">{s.username}</p>
              <p className="text-[11px] font-semibold text-sky-300/80">Apoia desde {sinceLabel(s.since)}</p>
            </div>
          </Link>
        ))}

        {supporters.length < INVITE_BELOW && (
          <a
            href="#union-plus"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-blue-500/30 p-3 transition-colors hover:border-blue-400/60"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <Plus className="h-5 w-5 text-blue-400" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-sky-300">{supporters.length === 0 ? "Seja o primeiro" : "Seja o próximo"}</p>
              <p className="text-[11px] font-semibold text-slate-500">Assine o UNION+</p>
            </div>
          </a>
        )}
      </div>
    </section>
  );
}
