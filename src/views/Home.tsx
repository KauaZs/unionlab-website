"use client";

import { useState, useEffect } from "react";
import { Search, Trophy, Sparkles, Clock, Megaphone, ExternalLink, Bot, Users, Flame } from "lucide-react";
import BotCard from "../components/BotCard";
import EventBanner from "../components/EventBanner";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

interface Bot {
  id: string;
  username: string;
  avatar: string | null;
  prefix: string;
  language: string;
  description: string;
  votes: number;
  rating?: number;
  feedbackCount?: number;
}

interface EventData {
  active: boolean;
  name: string;
  multiplier: number;
}

interface HomeProps {
  bots: Bot[];
  search: string;
  onSearchChange: (val: string) => void;
  loadingBots: boolean;
  activeEvent: EventData | null;
  onBotClick: (id: string) => void;
}

interface GlobalStats {
  totalBots: number;
  totalUsers: number;
  totalVotes: number;
}

export default function Home({ bots, search, onSearchChange, loadingBots, activeEvent, onBotClick }: HomeProps) {
  const [activeTab, setActiveTab] = useState<"popular" | "rated" | "recent">("popular");
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [activeOutdoor, setActiveOutdoor] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((res) => res.json())
      .then((data) => setStats(data as GlobalStats))
      .catch((err) => console.error("Error loading stats:", err));

    fetch("/api/public/outdoor/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setActiveOutdoor(data);
        }
      })
      .catch((err) => console.error("Error loading active outdoor:", err));
  }, []);

  const safeBots = Array.isArray(bots) ? bots : [];
  const filteredBots = safeBots.filter(
    (bot) =>
      bot.username.toLowerCase().includes(search.toLowerCase()) ||
      bot.description.toLowerCase().includes(search.toLowerCase()) ||
      bot.language.toLowerCase().includes(search.toLowerCase())
  );

  const sortedBots = [...filteredBots].sort((a, b) => {
    if (activeTab === "popular") {
      return b.votes - a.votes;
    }
    if (activeTab === "rated") {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    }
    // "recent" - sort by snowflake ID
    return b.id.localeCompare(a.id);
  });

  const globalTopBot = safeBots.length > 0
    ? [...safeBots].sort((a, b) => b.votes - a.votes)[0]
    : null;
  const topBotId = globalTopBot && globalTopBot.votes > 0 ? globalTopBot.id : null;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
          Encontre os melhores <br />
          <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            bots para o seu servidor.
          </span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed">
          Navegue pelas criações inovadoras de nossa comunidade de desenvolvedores, apoie seus favoritos e ganhe unicoins avaliando o bot!
        </p>
        
        {/* Search input wrapped in styled container */}
        <div className="relative w-full max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-zinc-300 transition-colors" />
          <Input
            type="text"
            placeholder="Pesquise por nome, linguagem, descrição..."
            className="pl-12 pr-4 h-12 shadow-lg shadow-black/20"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Stats Counter Widget */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-zinc-950/20 border border-slate-900 rounded-2xl p-4 text-center w-full max-w-xl mx-auto md:mx-0">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-center gap-1">
                <Bot className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
                Bots
              </span>
              <span className="block text-sm font-black text-white">{stats.totalBots}</span>
            </div>
            <div className="space-y-1 border-x border-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
                Usuários
              </span>
              <span className="block text-sm font-black text-white">{stats.totalUsers}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
                Votos
              </span>
              <span className="block text-sm font-black text-white">{stats.totalVotes}</span>
            </div>
          </div>
        )}
      </div>

      {activeEvent && activeEvent.active && (
        <EventBanner name={activeEvent.name} multiplier={activeEvent.multiplier} />
      )}

      {/* Outdoor Highlight Banner Card */}
      {activeOutdoor && (
        <div 
          className="relative bg-zinc-950/40 rounded-3xl border border-slate-900 overflow-hidden flex flex-col md:flex-row items-center md:items-stretch justify-between p-6 gap-6 shadow-2xl"
          style={{ borderLeft: `4px solid ${activeOutdoor.hexColor || '#FFC800'}` }}
        >
          {/* Main Info */}
          <div className="flex flex-col md:flex-row items-center gap-5 relative z-10">
            <img 
              src={activeOutdoor.avatar ? `https://cdn.discordapp.com/avatars/${activeOutdoor.botId}/${activeOutdoor.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
              alt={activeOutdoor.username} 
              className="w-16 h-16 rounded-2xl border border-slate-900 object-cover shrink-0 shadow-lg"
            />
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-white font-black text-base">{activeOutdoor.username}</span>
                <Badge variant="default" className="bg-amber-500/10 border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Megaphone className="w-3 h-3 text-amber-400" />
                  Destaque do Dia
                </Badge>
              </div>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xl">
                {activeOutdoor.description}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <Badge variant="default" className="text-[9px] bg-slate-900 border-slate-800 text-slate-300 font-bold">
                  lang: {activeOutdoor.language}
                </Badge>
                <Badge variant="default" className="text-[9px] bg-slate-900 border-slate-800 text-slate-300 font-bold">
                  prefix: {activeOutdoor.prefix}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row md:flex-col justify-center gap-3 shrink-0 items-center md:items-end w-full md:w-auto mt-2 md:mt-0 relative z-10">
            <a 
              href={`https://discord.com/oauth2/authorize?client_id=${activeOutdoor.botId}&permissions=0&scope=bot%20applications.commands`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all duration-150 shadow-md w-1/2 md:w-40"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Adicionar Bot
            </a>
            <button
              onClick={() => onBotClick(activeOutdoor.botId)}
              className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-800 text-slate-200 hover:text-white hover:bg-zinc-800 transition-all duration-150 w-1/2 md:w-40"
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Sections Tab Bar */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 border-b border-slate-900 pb-4">
        <button
          onClick={() => setActiveTab("popular")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "popular"
              ? "bg-white text-black shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Bots Populares
        </button>
        <button
          onClick={() => setActiveTab("rated")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "rated"
              ? "bg-white text-black shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Boa Avaliação
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "recent"
              ? "bg-white text-black shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Recém Adicionados
        </button>
      </div>

      {loadingBots ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedBots.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-medium">
              Nenhum bot encontrado para os termos pesquisados.
            </div>
          ) : (
            sortedBots.map((bot) => (
              <BotCard
                key={bot.id}
                id={bot.id}
                username={bot.username}
                avatar={bot.avatar}
                prefix={bot.prefix}
                language={bot.language}
                description={bot.description}
                votes={bot.votes}
                rating={bot.rating}
                feedbackCount={bot.feedbackCount}
                onClick={() => onBotClick(bot.id)}
                isTop1={bot.id === topBotId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
