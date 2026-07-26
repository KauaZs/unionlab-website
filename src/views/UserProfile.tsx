"use client";

import { useEffect, useState } from "react";
import { Coins, LogOut, Shield, Flame, Award, Bot, Check, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface User {
  id: string;
  username: string;
  avatar: string | null;
  unicoins: number;
  cooldowns?: {
    voteBot?: number;
    rep?: number;
  };
}

interface Streak {
  type: string;
  count: number;
  lastUpdated: string;
}

interface UserBadge {
  id: string;
  selected: boolean;
  name: string;
  description: string;
  emoji: string;
}

interface UserBot {
  id: string;
  username: string;
  avatar: string | null;
  prefix: string;
  language: string;
  votes: number;
}

interface FullUserData {
  bannerUrl: string | null;
  aboutme?: string;
  streaks: Streak[];
  badges: UserBadge[];
  bots: UserBot[];
}

interface UserProfileProps {
  user: User | null;
  onUpdateUser?: () => void;
  onLogout: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function UserProfile({ user, onLogout, showToast }: UserProfileProps) {
  const [data, setData] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-400 font-bold text-sm">Faça login para ver seu perfil.</p>
        <Button variant="premium" onClick={() => window.location.href = "/api/auth/login"}>Login com Discord</Button>
      </div>
    );
  }

  // Edit Description States
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editAboutText, setEditAboutText] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);

  const handleSaveAbout = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingAbout(true);
    fetch("/api/public/users/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ aboutme: editAboutText }),
    })
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Erro ao atualizar perfil.");
        return resData;
      })
      .then((resData) => {
        showToast("Seu sobre mim foi atualizado!", "success");
        if (data) {
          setData({
            ...data,
            aboutme: resData.aboutme,
          });
        }
        setIsEditingAbout(false);
      })
      .catch((err) => {
        showToast(err.message || "Erro ao salvar perfil.", "error");
      })
      .finally(() => {
        setSavingAbout(false);
      });
  };

  useEffect(() => {
    fetch(`/api/public/users/${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados do perfil");
        return res.json();
      })
      .then((resData) => {
        setData(resData as FullUserData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setData(null);
        setLoading(false);
      });
  }, [user.id]);

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.png`;
  };

  const getEmojiUrl = (emoji: any) => {
    if (!emoji) return null;
    if (typeof emoji === "object") {
      return emoji.url || null;
    }
    if (typeof emoji === "string") {
      if (emoji.startsWith("http://") || emoji.startsWith("https://")) {
        return emoji;
      }
      const match = emoji.match(/<a?:[a-zA-Z0-9_]+:([0-9]+)>/);
      if (match) {
        const isAnimated = emoji.startsWith("<a:");
        return `https://cdn.discordapp.com/emojis/${match[1]}.${isAnimated ? "gif" : "png"}`;
      }
    }
    return null;
  };

  const getStreakLabel = (type: string) => {
    switch (type) {
      case "daily": return "Diário";
      case "vote": return "Votos";
      case "rep": return "Reputações";
      default: return type;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Banner / Cover Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-900 shadow-2xl bg-zinc-950">
        {data?.bannerUrl ? (
          <img 
            src={data.bannerUrl} 
            alt="User Banner" 
            className="w-full h-44 md:h-52 object-cover object-center"
          />
        ) : (
          <div className="w-full h-44 md:h-52 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 flex items-center justify-center border-b border-slate-900/50">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          </div>
        )}
        
        {/* Profile Card Header overlay */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 px-8 pb-6 relative z-10">
          <img 
            className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-slate-950 bg-slate-950 shadow-2xl object-cover -mt-12 md:-mt-14 shrink-0"
            src={getAvatarUrl(user.id, user.avatar)}
            alt={user.username}
          />
          <div className="flex-1 space-y-2 text-center md:text-left pt-2 md:pt-0">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans">{user.username}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <Badge variant="default" className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>{user.unicoins} unicoins</span>
              </Badge>
              {user.cooldowns?.voteBot && user.cooldowns.voteBot > Date.now() ? (
                <Badge variant="destructive">
                  cooldown ativo
                </Badge>
              ) : (
                <Badge variant="success" className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>voto disponível</span>
                </Badge>
              )}
            </div>
            {isEditingAbout ? (
              <div className="flex items-center gap-2 mt-2 max-w-md mx-auto md:mx-0">
                <Input
                  type="text"
                  placeholder="Seu sobre mim... (mín. 6, máx. 200 caracteres)"
                  value={editAboutText}
                  onChange={(e) => setEditAboutText(e.target.value)}
                  className="h-8 text-xs bg-slate-950/60"
                  maxLength={200}
                  disabled={savingAbout}
                />
                <Button 
                  size="sm" 
                  onClick={handleSaveAbout} 
                  disabled={savingAbout || editAboutText.trim().length <= 5}
                  className="h-8 text-xs px-3 font-bold"
                >
                  {savingAbout ? "..." : "Salvar"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditingAbout(false)}
                  disabled={savingAbout}
                  className="h-8 text-xs px-3 font-bold"
                >
                  X
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 group">
                <p className="text-slate-400 text-xs italic font-medium max-w-lg">
                  "{data?.aboutme || "Esse usuário ainda não definiu um sobre mim."}"
                </p>
                <button
                  onClick={() => {
                    setEditAboutText(data?.aboutme || "");
                    setIsEditingAbout(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-all duration-150 p-1 rounded hover:bg-slate-900/30"
                  title="Editar sobre mim"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Badges & Streaks */}
        <div className="space-y-6">
          
          {/* Badges Box */}
          <Card className="border border-slate-900 bg-slate-950/10">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" />
                <span>Badges e Conquistas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {loading ? (
                <span className="text-xs text-slate-500 font-semibold">Carregando...</span>
              ) : !data || data.badges.filter(b => b.selected).length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">Nenhuma badge equipada no momento.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {data.badges.filter(b => b.selected).map((badge) => {
                    const emojiUrl = getEmojiUrl(badge.emoji);
                    return (
                      <div 
                        key={badge.id}
                        title={`${badge.name}: ${badge.description}`}
                        className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-help"
                      >
                        {emojiUrl ? (
                          <img src={emojiUrl} alt={badge.name} className="w-4 h-4 object-contain" />
                        ) : (
                          <span className="text-sm">{badge.emoji}</span>
                        )}
                        <span className="text-xs font-bold text-slate-200">{badge.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streaks Box */}
          <Card className="border border-slate-900 bg-slate-950/10">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
                <span>Atividades & Streaks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {loading ? (
                <span className="text-xs text-slate-500 font-semibold">Carregando...</span>
              ) : !data || data.streaks.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">Nenhuma streak ativa encontrada.</p>
              ) : (
                data.streaks.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-900/60 last:border-none pb-3 last:pb-0">
                    <span className="text-xs text-slate-400 font-semibold">{getStreakLabel(s.type)}</span>
                    <Badge variant="default" className="flex items-center gap-1 bg-orange-500/10 border-orange-500/20 text-orange-400 font-extrabold">
                      <Flame className="w-3 h-3 fill-orange-500/20" />
                      <span>{s.count} dias</span>
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Bots Owned & Integration Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bots Owned Card */}
          <Card className="border border-slate-900 bg-slate-950/10">
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base font-bold text-slate-200">
                  Meus Bots Verificados
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Bots que pertencem à sua conta da Union.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {loading ? (
                <span className="text-xs text-slate-500 font-semibold">Carregando...</span>
              ) : !data || data.bots.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm font-medium">
                  Você não possui nenhum bot verificado adicionado.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.bots.map((bot) => (
                    <div 
                      key={bot.id}
                      onClick={() => (window.location.hash = `#/bot/${bot.id}`)}
                      className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-900 bg-slate-950/20 hover:border-slate-800 hover:bg-slate-900/10 cursor-pointer transition-all duration-200"
                    >
                      <img 
                        src={getAvatarUrl(bot.id, bot.avatar)} 
                        alt={bot.username}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-900"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-200 truncate">{bot.username}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default" className="text-[9px] px-1.5 py-0">
                            {bot.language}
                          </Badge>
                          <span className="text-[10px] text-slate-500 font-bold">
                            🔥 {bot.votes} votos
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integration & Settings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border border-slate-900 bg-slate-950/10">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Sincronização</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-slate-400 text-xs leading-relaxed">
                Suas informações de streaks, badges e unicoins são sincronizadas com a base de dados central da Union no Discord.
              </CardContent>
            </Card>

            <Card className="border border-slate-900 bg-slate-950/10 flex flex-col justify-between">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Gerenciar Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 rounded-xl h-10 text-xs"
                  onClick={onLogout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
