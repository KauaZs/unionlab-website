"use client";

import { Flame, Code2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface BotCardProps {
  id: string;
  username: string;
  avatar: string | null;
  prefix: string;
  language: string;
  description: string;
  votes: number;
  rating?: number;
  feedbackCount?: number;
  onClick: () => void;
  isTop1?: boolean;
}

export default function BotCard({ id, username, avatar, prefix, language, description, votes, rating, feedbackCount, onClick, isTop1 }: BotCardProps) {
  const getAvatarUrl = (botId: string, avatarHash: string | null) => {
    if (!avatarHash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${botId}/${avatarHash}.png`;
  };

  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer group flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${
        isTop1 
          ? "border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-slate-950/20 hover:border-amber-500/50 shadow-xl shadow-amber-500/[0.02]" 
          : "hover:border-slate-800"
      }`}
    >
      {isTop1 && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20 z-10 tracking-wider">
          <span>🏆 Top #1</span>
        </div>
      )}
      <div>
        <CardHeader className="flex flex-row items-center gap-4 p-6">
          <img 
            className={`w-16 h-16 rounded-2xl border object-cover shadow-lg group-hover:scale-105 transition-transform duration-300 ${
              isTop1 ? "border-amber-500/30 bg-amber-500/5" : "border-slate-900 bg-slate-900"
            }`} 
            src={getAvatarUrl(id, avatar)} 
            alt={username} 
          />
          <div className="flex flex-col gap-1.5">
            <h3 className="font-bold text-lg text-white group-hover:text-zinc-200 transition-colors duration-200">
              {username}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="default" className="w-fit">
                {language}
              </Badge>
              {rating !== undefined && feedbackCount !== undefined && feedbackCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <span>⭐ {rating.toFixed(1)}</span>
                  <span className="text-[9px] text-amber-500/80 font-medium">({feedbackCount})</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 min-height-[40px]">
            {description}
          </p>
        </CardContent>
      </div>

      <CardFooter className="px-6 py-4 border-t border-slate-900/50 bg-slate-900/50 flex flex-col gap-3.5">
        <div className="flex justify-between items-center w-full text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Prefixo: <code className="bg-slate-900/60 text-zinc-200 border border-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">{prefix}</code></span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
            <span>{votes} votos</span>
          </div>
        </div>
        
        <div className="flex justify-end w-full border-t border-slate-900/30 pt-3">
          <span className="flex items-center gap-1 text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors duration-200">
            <span>Ver perfil</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
