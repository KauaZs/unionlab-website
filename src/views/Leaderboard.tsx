"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Bot, Flame, Coins, ShieldAlert, Sparkles, User } from "lucide-react";
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
  reps: {
    id: string;
    username: string;
    avatar: string | null;
    reps: number;
  }[];
}

export default function Leaderboard() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bots" | "users" | "reps">("bots");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
      </div>
    );
  }

  // Determine active list
  const activeList = data ? data[activeTab] || [] : [];
  const podium = activeList.slice(0, 3);
  const remainingList = activeList.slice(3);

  const getScoreText = (item: any) => {
    if (activeTab === "bots") {
      return `${item.votes} votos`;
    }
    if (activeTab === "users") {
      return `${item.unicoins} unicoins`;
    }
    return `${item.reps} reps`;
  };

  const handleProfileClick = (id: string) => {
    if (activeTab === "bots") {
      router.push(`/bot/${id}`);
    } else {
      router.push(`/user/${id}`);
    }
  };

  return (
    <div className="space-y-10">
      {/* Title */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center shadow-lg shadow-black/40">
          <Trophy className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
          Mural dos Campeões
        </h1>
        <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
          Descubra os robôs e membros que lideram nosso servidor em votos, moedas acumuladas e reputação positiva!
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center justify-center gap-1.5 max-w-md mx-auto bg-slate-900/40 p-1 rounded-2xl border border-slate-900/80">
        <button
          onClick={() => setActiveTab("bots")}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-1 ${
            activeTab === "bots"
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Bot className="w-4 h-4" />
          Top Bots
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-1 ${
            activeTab === "users"
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Coins className="w-4 h-4" />
          Unicoins
        </button>
        <button
          onClick={() => setActiveTab("reps")}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-1 ${
            activeTab === "reps"
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/10" />
          Reps
        </button>
      </div>

      {/* Leaderboard Card */}
      <Card className="border border-slate-900 bg-slate-950/10 max-w-2xl mx-auto overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-900/50 bg-slate-900/10">
          <div className="flex items-center gap-2.5">
            {activeTab === "bots" && <Bot className="w-5 h-5 text-slate-400" />}
            {activeTab === "users" && <Coins className="w-5 h-5 text-slate-400" />}
            {activeTab === "reps" && <Sparkles className="w-5 h-5 text-slate-400" />}
            <CardTitle className="text-base font-bold text-slate-200">
              {activeTab === "bots" && "Ranking de Votos (Bots)"}
              {activeTab === "users" && "Ranking de Unicoins (Membros)"}
              {activeTab === "reps" && "Ranking de Reputação (Membros)"}
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">
            {activeTab === "bots" && "Os robôs mais populares votados pela comunidade nas últimas semanas."}
            {activeTab === "users" && "Membros mais dedicados e ricos em moedas do ecossistema."}
            {activeTab === "reps" && "Os membros mais confiáveis e apoiados pela nossa comunidade."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {activeList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium text-sm flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Nenhum registro encontrado.</span>
            </div>
          ) : (
            <>
              {/* Podium Visual */}
              <div className="flex items-end justify-center gap-6 py-6 pb-8 border-b border-slate-900/60 max-w-lg mx-auto">
                {/* 2nd Place */}
                {podium[1] && (
                  <div 
                    className="flex flex-col items-center gap-1.5 w-24 sm:w-28 group cursor-pointer" 
                    onClick={() => handleProfileClick(podium[1].id)}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-300 overflow-hidden shadow-lg shadow-slate-300/10 group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={getAvatarUrl(podium[1].id, podium[1].avatar)} 
                          alt={podium[1].username}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-300 text-black text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border border-slate-950">
                        2
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-slate-300 text-center truncate w-full mt-2 group-hover:text-white transition-colors">
                      {podium[1].username}
                    </span>
                    <span className="text-[10px] font-black text-slate-500">
                      {getScoreText(podium[1])}
                    </span>
                  </div>
                )}

                {/* 1st Place */}
                {podium[0] && (
                  <div 
                    className="flex flex-col items-center gap-1.5 w-28 sm:w-32 group cursor-pointer" 
                    onClick={() => handleProfileClick(podium[0].id)}
                  >
                    <div className="relative -top-3">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={getAvatarUrl(podium[0].id, podium[0].avatar)} 
                          alt={podium[0].username}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-base animate-bounce">👑</div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-black rounded-full h-5.5 w-5.5 flex items-center justify-center border border-slate-950">
                        1
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-amber-400 text-center truncate w-full group-hover:text-amber-300 transition-colors">
                      {podium[0].username}
                    </span>
                    <span className="text-xs font-black text-amber-500">
                      {getScoreText(podium[0])}
                    </span>
                  </div>
                )}

                {/* 3rd Place */}
                {podium[2] && (
                  <div 
                    className="flex flex-col items-center gap-1.5 w-24 sm:w-28 group cursor-pointer" 
                    onClick={() => handleProfileClick(podium[2].id)}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-700 overflow-hidden shadow-lg shadow-amber-700/10 group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={getAvatarUrl(podium[2].id, podium[2].avatar)} 
                          alt={podium[2].username}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border border-slate-950">
                        3
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-amber-700 text-center truncate w-full mt-2 group-hover:text-amber-600 transition-colors">
                      {podium[2].username}
                    </span>
                    <span className="text-[10px] font-black text-slate-500">
                      {getScoreText(podium[2])}
                    </span>
                  </div>
                )}
              </div>

              {/* Ranks 4-10 List */}
              <div className="space-y-2 mt-6">
                {remainingList.map((anyItem, index) => {
                  const item = anyItem as any;
                  const actualIndex = index + 3;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => handleProfileClick(item.id)}
                      className="flex items-center justify-between py-2.5 border-b border-slate-900/60 last:border-none hover:bg-slate-900/10 rounded-xl px-4 transition-all duration-150 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="font-extrabold text-xs w-6 text-center text-slate-500">
                          #{actualIndex + 1}
                        </span>
                        <img 
                          src={getAvatarUrl(item.id, item.avatar)} 
                          alt={item.username} 
                          className={`w-9 h-9 border border-slate-900 object-cover ${activeTab === "bots" ? "rounded-xl" : "rounded-full"}`}
                        />
                        <span 
                          className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors duration-150"
                        >
                          {item.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-extrabold text-xs">
                        {activeTab === "bots" && <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" />}
                        {activeTab === "users" && <Coins className="w-3.5 h-3.5 text-amber-500" />}
                        {activeTab === "reps" && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />}
                        <span>{activeTab === "bots" ? item.votes : activeTab === "users" ? item.unicoins : item.reps}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
