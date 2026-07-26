"use client";

import { useState, useEffect } from "react";
import { Trophy, Bot, Flame, Coins, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

interface LeaderboardData {
  bots: {
    id: string;
    username: string;
    avatar: string | null;
    votes: number;
  }[];
  users: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  }[];
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/leaderboard")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData as LeaderboardData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setData(null);
        setLoading(false);
      });
  }, []);

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.png`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "text-amber-400"; // Gold
    if (index === 1) return "text-slate-300"; // Silver
    if (index === 2) return "text-amber-700"; // Bronze
    return "text-slate-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Title */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-md">
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
          Mural dos Campeões
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
          Descubra os robôs que mais engajaram nossa comunidade e os membros mais ativos do servidor!
        </p>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Bots Rank Card */}
        <Card className="border border-slate-900 bg-slate-950/10">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-zinc-400" />
              <CardTitle className="text-base font-bold text-slate-200">
                Top Bots (Votos)
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Bots mais votados pela comunidade nas últimas semanas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3.5">
            {!data || data.bots.length === 0 ? (
              <div className="text-center py-6 text-slate-500 font-medium text-sm flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Nenhum bot catalogado.</span>
              </div>
            ) : (
              data.bots.map((bot, index) => (
                <div 
                  key={bot.id} 
                  className="flex items-center justify-between py-2 border-b border-slate-900/60 last:border-none hover:bg-slate-900/10 rounded-xl px-2 transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`font-extrabold text-sm w-5 text-center ${getRankColor(index)}`}>
                      #{index + 1}
                    </span>
                    <img 
                      src={getAvatarUrl(bot.id, bot.avatar)} 
                      alt={bot.username} 
                      className="w-9 h-9 rounded-xl border border-slate-900 object-cover"
                    />
                    <span 
                      className="font-bold text-sm text-slate-200 hover:text-zinc-400 cursor-pointer transition-colors duration-150"
                      onClick={() => (window.location.hash = `#/bot/${bot.id}`)}
                    >
                      {bot.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 font-extrabold text-xs">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" />
                    <span>{bot.votes}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Users Rank Card */}
        <Card className="border border-slate-900 bg-slate-950/10">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-zinc-400" />
              <CardTitle className="text-base font-bold text-slate-200">
                Top Membros (Unicoins)
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Membros mais ricos em Unicoins acumuladas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3.5">
            {!data || data.users.length === 0 ? (
              <div className="text-center py-6 text-slate-500 font-medium text-sm flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Nenhum membro listado.</span>
              </div>
            ) : (
              data.users.map((user, index) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between py-2 border-b border-slate-900/60 last:border-none hover:bg-slate-900/10 rounded-xl px-2 transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`font-extrabold text-sm w-5 text-center ${getRankColor(index)}`}>
                      #{index + 1}
                    </span>
                    <img 
                      src={getAvatarUrl(user.id, user.avatar)} 
                      alt={user.username} 
                      className="w-9 h-9 rounded-full border border-slate-900 object-cover"
                    />
                    <span 
                      className="font-bold text-sm text-slate-200 hover:text-zinc-400 hover:underline cursor-pointer transition-all duration-150"
                      onClick={() => (window.location.hash = `#/user/${user.id}`)}
                    >
                      {user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-extrabold text-xs">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{user.unicoins}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
