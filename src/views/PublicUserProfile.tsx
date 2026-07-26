"use client";

import { useEffect, useState } from "react";
import { Coins, Flame, Award, AlertCircle, Bot, Heart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ReCaptcha from "../components/ReCaptcha";

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

interface RepReceived {
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  message: string;
  createdAt: string;
}

interface UserProfileData {
  id: string;
  username: string;
  avatar: string | null;
  unicoins: number;
  bannerUrl: string | null;
  aboutme?: string;
  streaks: Streak[];
  badges: UserBadge[];
  bots: UserBot[];
  reputation?: number;
  reps?: RepReceived[];
}

interface PublicUserProfileProps {
  userId: string;
  currentUser: {
    id: string;
    username: string;
    avatar: string | null;
    cooldowns?: {
      rep?: number;
      voteBot?: number;
    };
  } | null;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  showCelebration?: (title: string, subtitle: string, rewardText: string, streakText?: string) => void;
  recaptchaSiteKey?: string | null;
}

export default function PublicUserProfile({ userId, currentUser, showToast, showCelebration, recaptchaSiteKey }: PublicUserProfileProps) {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reputation Form States
  const [repMessage, setRepMessage] = useState("");
  const [sendingRep, setSendingRep] = useState(false);
  const [repError, setRepError] = useState<string | null>(null);
  const [repSuccess, setRepSuccess] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/public/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Usuário não encontrado");
        return res.json();
      })
      .then((resData) => {
        setData(resData as UserProfileData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erro ao carregar perfil do usuário");
        setLoading(false);
      });
  }, [userId]);
  const handleSendRep = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setRepError("Você precisa estar logado para enviar reputação.");
      return;
    }

    if (recaptchaSiteKey && !captchaToken) {
      setRepError("Confirme que você não é um robô (reCAPTCHA).");
      return;
    }

    setSendingRep(true);
    setRepError(null);
    setRepSuccess(null);

    fetch(`/api/public/users/${userId}/rep`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ message: repMessage, captchaToken }),
    })
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Erro ao enviar reputação.");
        return resData;
      })
      .then((resData) => {
        if (showCelebration) {
          showCelebration(
            "Reputação Enviada! ⭐",
            `Sua reputação para ${data?.username || "o usuário"} foi enviada com sucesso!`,
            `+${resData.coins} Unicoins`,
            resData.streakMessage
          );
        } else {
          showToast("Reputação enviada!", "success");
        }
        setRepMessage("");
        
        // Refresh profile data
        fetch(`/api/public/users/${userId}`)
          .then(res => res.json())
          .then(resData => setData(resData as UserProfileData));
      })
      .catch((err) => {
        setRepError(err.message || "Erro ao enviar reputação.");
      })
      .finally(() => {
        setSendingRep(false);
      });
  };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Oops!</h2>
        <p className="text-slate-400 text-sm">{error || "Não conseguimos carregar este perfil."}</p>
        <button 
          onClick={() => (window.location.hash = "#/")}
          className="text-xs font-bold text-zinc-400 hover:underline"
        >
          Voltar para a página inicial
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Banner / Cover Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-900 shadow-2xl bg-zinc-950">
        {data.bannerUrl ? (
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
            src={getAvatarUrl(data.id, data.avatar)}
            alt={data.username}
          />
          <div className="flex-1 space-y-2 text-center md:text-left pt-2 md:pt-0">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans">{data.username}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <Badge variant="default" className="flex items-center gap-1 bg-amber-500/10 border-amber-500/20 text-amber-400">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>{data.unicoins} unicoins</span>
              </Badge>
              <Badge variant="default" className="flex items-center gap-1 bg-zinc-900 border-zinc-800 text-white font-bold">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                <span>Reputação: {data.reputation || 0}</span>
              </Badge>
              <span className="text-[10px] text-slate-500 font-bold font-mono">ID: {data.id}</span>
            </div>
            {data.aboutme && (
              <p className="text-slate-400 text-xs italic font-medium max-w-lg mt-2 mx-auto md:mx-0">
                "{data.aboutme}"
              </p>
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
                <Award className="w-4 h-4 text-zinc-400" />
                <span>Badges e Conquistas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {data.badges.filter(b => b.selected).length === 0 ? (
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
              {data.streaks.length === 0 ? (
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

          {/* Send Reputation Card */}
          {currentUser && currentUser.id !== data.id && (
            <Card className="border border-slate-900 bg-slate-950/10">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <span>Enviar Reputação</span>
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-medium">
                  Envie reputação com uma mensagem de até 50 caracteres para apoiar {data.username}.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                {repError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-[11px] font-medium leading-normal">
                    {repError}
                  </div>
                )}
                {repSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-xl text-[11px] font-medium leading-normal">
                    {repSuccess}
                  </div>
                )}

                {currentUser.cooldowns?.rep && currentUser.cooldowns.rep > Date.now() ? (
                  <div className="bg-zinc-950 border border-slate-900/60 p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Você está em cooldown</span>
                    <span className="text-xs font-bold text-zinc-300 mt-1 block">
                      Tente novamente às: {new Date(currentUser.cooldowns.rep).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSendRep} className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Mensagem legal... (mín. 6, máx. 50 caracteres)"
                      className="h-10 text-xs shadow-sm bg-slate-950/40"
                      value={repMessage}
                      onChange={(e) => setRepMessage(e.target.value)}
                      maxLength={50}
                      disabled={sendingRep}
                      required
                    />
                    {recaptchaSiteKey && (
                      <ReCaptcha
                        siteKey={recaptchaSiteKey}
                        onChange={setCaptchaToken}
                      />
                    )}
                    <Button 
                      type="submit" 
                      variant="premium" 
                      className="w-full h-9 rounded-xl text-xs font-bold"
                      disabled={sendingRep || repMessage.length < 6 || (!!recaptchaSiteKey && !captchaToken)}
                    >
                      {sendingRep ? "Enviando..." : "Dar Reputação"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {!currentUser && (
            <Card className="border border-slate-900 bg-slate-950/10 p-5 text-center space-y-2">
              <Heart className="w-6 h-6 text-red-500/30 mx-auto" />
              <p className="text-[11px] text-slate-500 font-bold">Faça login para poder enviar reputação para este usuário.</p>
            </Card>
          )}

        </div>

        {/* Right Side: Bots Owned */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-900 bg-slate-950/10">
            <CardHeader className="p-6">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-zinc-400" />
                <CardTitle className="text-base font-bold text-slate-200">
                  Bots Adicionados por {data.username}
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Lista de bots verificados que pertencem a este desenvolvedor.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {data.bots.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm font-medium">
                  Este desenvolvedor não possui nenhum bot listado.
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

          {/* Reputations Received wall */}
          <Card className="border border-slate-900 bg-slate-950/10">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Mural de Reputações</span>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Feedbacks e reputações mais recentes deixadas por outros usuários.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {!data.reps || data.reps.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium py-4 text-center">
                  Nenhuma reputação recebida ainda. Seja o primeiro a dar rep!
                </p>
              ) : (
                <div className="space-y-4">
                  {data.reps.map((r, idx) => (
                    <div key={idx} className="flex gap-3.5 p-4 rounded-xl border border-slate-900 bg-slate-950/20">
                      <img 
                        src={getAvatarUrl(r.senderId, r.senderAvatar)}
                        alt={r.senderName}
                        className="w-10 h-10 rounded-full shrink-0 object-cover border border-slate-900"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{r.senderName}</span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {new Date(r.createdAt).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic font-medium">
                          "{r.message}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
