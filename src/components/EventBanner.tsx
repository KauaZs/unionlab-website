"use client";

import { Zap } from "lucide-react";

interface EventBannerProps {
  name: string;
  multiplier: number;
}

export default function EventBanner({ name, multiplier }: EventBannerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-slate-950 to-cyan-950/20 text-slate-200 shadow-xl shadow-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-400 fill-blue-400/20" />
          </div>
          <div className="text-center sm:text-left">
            <span className="bg-blue-500/15 border border-blue-500/20 text-blue-400 font-extrabold text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full">
              Evento Ativo
            </span>
            <h4 className="font-bold text-sm text-white mt-1">
              {name} ({multiplier}x recompensas de Unicoins!)
            </h4>
          </div>
        </div>
        <span className="text-xs font-extrabold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-3 py-1.5 rounded-lg select-none">
          Vote agora!
        </span>
      </div>
    </div>
  );
}
