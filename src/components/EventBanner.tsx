"use client";

import { Zap, Users } from "lucide-react";

interface EventBannerProps {
  name: string;
  multiplier: number;
  eventKey?: string;
  progress?: {
    current: number;
    target: number;
  } | null;
}

export default function EventBanner({ name, multiplier, eventKey, progress }: EventBannerProps) {
  const isGoal = eventKey === "community_goal";

  return (
    <div className={`w-full max-w-4xl mx-auto mb-8 ${isGoal ? "" : "animate-pulse"}`}>
      <div 
        className={`flex flex-col gap-4 p-5 rounded-2xl border text-slate-200 shadow-xl transition-all duration-300 ${
          isGoal 
            ? "border-amber-500/20 bg-gradient-to-br from-amber-950/10 via-slate-950 to-yellow-950/10 shadow-amber-500/5" 
            : "border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-slate-950 to-cyan-950/20 shadow-blue-500/5"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isGoal 
                  ? "bg-amber-500/10 border-amber-500/20" 
                  : "bg-blue-500/10 border-blue-500/20"
              }`}
            >
              {isGoal ? (
                <Users className="w-4 h-4 text-amber-400" />
              ) : (
                <Zap className="w-4 h-4 text-blue-400 fill-blue-400/20" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <span 
                className={`border font-extrabold text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full ${
                  isGoal 
                    ? "bg-amber-500/15 border-amber-500/20 text-amber-400" 
                    : "bg-blue-500/15 border-blue-500/20 text-blue-400"
                }`}
              >
                {isGoal ? "Meta da Comunidade Ativo" : "Evento Ativo"}
              </span>
              <h4 className="font-bold text-sm text-white mt-1">
                {isGoal 
                  ? `${name} (VIP +3 dias grátis para todos que votarem hoje!)` 
                  : `${name} (${multiplier}x recompensas de Unicoins!)`}
              </h4>
            </div>
          </div>
          <span 
            className={`text-xs font-extrabold px-3 py-1.5 rounded-lg select-none shrink-0 ${
              isGoal 
                ? "text-amber-400 bg-amber-950/40 border border-amber-800/30" 
                : "text-cyan-400 bg-cyan-950/40 border border-cyan-800/30"
            }`}
          >
            Vote agora!
          </span>
        </div>

        {/* Render progress bar for community goal */}
        {isGoal && progress && (
          <div className="pt-2 border-t border-slate-900/60">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                Progresso Geral: <strong className="text-white">{progress.current} de {progress.target} votos</strong>
              </span>
              <span className="text-amber-400">{Math.round((progress.current / progress.target) * 100)}% concluído</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900 p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-500 via-amber-450 to-yellow-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
