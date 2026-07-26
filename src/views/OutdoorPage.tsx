"use client";

import { useEffect, useState } from "react";
import { Megaphone, Check, Coins, Edit2, Play, Flame, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

interface OutdoorBot {
  id: string;
  username: string;
  avatar: string | null;
  description: string;
  hexColor: string;
}

interface QueueItem {
  botId: string;
  ownerId: string;
  username: string;
  avatar: string | null;
  position: number;
}

interface OutdoorPageProps {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  } | null;
  onUpdateUser: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function OutdoorPage({ user, onUpdateUser, showToast }: OutdoorPageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcing, setAnnouncing] = useState(false);

  // API Data
  const [userBots, setUserBots] = useState<OutdoorBot[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [alreadyInQueue, setAlreadyInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);

  // Form State
  const [selectedBotId, setSelectedBotId] = useState("");
  const [description, setDescription] = useState("");
  const [hexColor, setHexColor] = useState("");

  const fetchOutdoorStatus = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/public/outdoor", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserBots(data.userBots || []);
        setQueue(data.queue || []);
        setAlreadyInQueue(data.alreadyInQueue || false);
        setQueuePosition(data.position || 0);
        
        // Auto-select first bot if none selected
        if (data.userBots && data.userBots.length > 0 && !selectedBotId) {
          const first = data.userBots[0];
          setSelectedBotId(first.id);
          setDescription(first.description || "");
          setHexColor(first.hexColor || "#FFFFFF");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOutdoorStatus();
  }, [user]);

  const handleBotChange = (botId: string) => {
    setSelectedBotId(botId);
    const target = userBots.find((b) => b.id === botId);
    if (target) {
      setDescription(target.description || "");
      setHexColor(target.hexColor || "#FFFFFF");
    }
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !selectedBotId) return;

    setSaving(true);
    fetch("/api/public/outdoor/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        botId: selectedBotId,
        description,
        hexColor,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao salvar informações");
        return data;
      })
      .then(() => {
        showToast("Informações do bot salvas com sucesso!", "success");
        
        // Refresh local userBots state
        setUserBots(
          userBots.map((b) =>
            b.id === selectedBotId
              ? { ...b, description, hexColor }
              : b
          )
        );
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao salvar informações.", "error");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleAnnounce = () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedBotId) return;

    setAnnouncing(true);
    fetch("/api/public/outdoor/announce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ botId: selectedBotId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao anunciar bot.");
        return data;
      })
      .then(() => {
        showToast("Seu bot foi adicionado à fila do outdoor!", "success");
        fetchOutdoorStatus();
        onUpdateUser();
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao anunciar bot.", "error");
      })
      .finally(() => {
        setAnnouncing(false);
      });
  };

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.png`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Mega Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950/20 border border-slate-900 rounded-3xl p-8 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Megaphone className="w-4 h-4 text-amber-500" />
            Destaque 24h
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Outdoor da Union
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Coloque o seu robô em destaque no topo do servidor do Discord da Union por 24 horas. Edite sua mensagem promocional, escolha cores e banners e apareça para milhares de membros.
          </p>
        </div>

        {alreadyInQueue && (
          <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:min-w-[240px]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fila do Outdoor</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="default" className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-extrabold">
                  {queuePosition === 1 ? "🥇 EM DESTAQUE!" : `${queuePosition}º lugar`}
                </Badge>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {queuePosition === 1 ? "Seu bot está sendo anunciado agora!" : "Aguarde sua vez para ser destacado"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Announce Form */}
        <div className="lg:col-span-2 space-y-6">
          {!user ? (
            <Card className="border border-slate-900 bg-slate-950/10 p-6 text-center space-y-2">
              <Megaphone className="w-8 h-8 text-slate-700 mx-auto" />
              <h3 className="font-bold text-sm text-slate-200">Faça login para anunciar</h3>
              <p className="text-xs text-slate-500">Conecte-se com sua conta do Discord para gerenciar e destacar seus bots.</p>
            </Card>
          ) : userBots.length === 0 ? (
            <Card className="border border-slate-900 bg-slate-950/10 p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-200">Nenhum bot verificado encontrado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                Você precisa ter pelo menos um bot verificado na Union cadastrado no seu perfil para poder anunciar no outdoor.
              </p>
            </Card>
          ) : (
            <Card className="border border-slate-900 bg-slate-950/10">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-base font-bold text-slate-200">
                  Apresentação do Bot
                </CardTitle>
                <CardDescription className="text-xs">
                  Preencha a ficha do bot antes de enviá-lo ao outdoor. Custo: 500 unicoins.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <form onSubmit={handleSaveInfo} className="space-y-4">
                  {/* Select Bot */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escolha o Bot</label>
                    <select
                      value={selectedBotId}
                      onChange={(e) => handleBotChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-950/60 border border-slate-900 text-xs font-bold text-slate-200 outline-none focus:border-zinc-800 transition-colors"
                      disabled={saving || announcing || alreadyInQueue}
                    >
                      {userBots.map((bot) => (
                        <option key={bot.id} value={bot.id}>
                          {bot.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mensagem Promocional</label>
                    <Input
                      type="text"
                      placeholder="Ex: O melhor bot de moderação e economia! (mín. 5, máx. 400)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={400}
                      disabled={saving || announcing || alreadyInQueue}
                      required
                    />
                  </div>

                  {/* Hex Color */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor Hexadecimal</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={hexColor.startsWith("#") && hexColor.length === 7 ? hexColor : "#FFFFFF"}
                        onChange={(e) => setHexColor(e.target.value)}
                        disabled={saving || announcing || alreadyInQueue}
                        className="w-10 h-10 rounded-xl border border-slate-900 bg-slate-950 cursor-pointer overflow-hidden shrink-0"
                        style={{ padding: '0', border: 'none' }}
                      />
                      <Input
                        type="text"
                        placeholder="Ex: #FF0000"
                        value={hexColor}
                        onChange={(e) => setHexColor(e.target.value)}
                        maxLength={7}
                        disabled={saving || announcing || alreadyInQueue}
                        required
                        className="font-mono"
                      />
                    </div>
                  </div>

                  {!alreadyInQueue && (
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full h-9 text-xs font-bold"
                      disabled={saving || announcing || description.length < 5}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      {saving ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  )}
                </form>

                {/* Announce Box CTA */}
                {!alreadyInQueue ? (
                  <div className="pt-6 border-t border-slate-900/60 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Custo do Outdoor</span>
                      <span className="flex items-center justify-center md:justify-start gap-1 text-sm font-extrabold text-white">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>500 Unicoins</span>
                      </span>
                    </div>

                    <Button
                      variant="premium"
                      className="h-10 px-6 text-xs font-extrabold shrink-0"
                      disabled={announcing || saving || user.unicoins < 500}
                      onClick={handleAnnounce}
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5 fill-black" />
                      Anunciar Agora
                    </Button>
                  </div>
                ) : (
                  <div className="bg-zinc-950 border border-slate-900 p-4 rounded-2xl flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                      Seu bot já está na fila! Para anunciar outro bot ou alterar as configurações, você precisa aguardar a expiração do anúncio ativo.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Live Queue */}
        <div className="space-y-6">
          <Card className="border border-slate-900 bg-slate-950/10">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Fila de Espera</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {queue.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center font-medium">Nenhum bot na fila. Anuncie o seu agora!</p>
              ) : (
                queue.map((item, idx) => (
                  <div
                    key={item.botId}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      item.ownerId === user?.id
                        ? "border-amber-500/30 bg-amber-500/5 shadow-md shadow-amber-500/2"
                        : "border-slate-900 bg-slate-950/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-500 w-5 text-center">#{idx + 1}</span>
                      <img
                        src={getAvatarUrl(item.botId, item.avatar)}
                        alt={item.username}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-900"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">{item.username}</span>
                        {item.ownerId === user?.id && (
                          <Badge variant="default" className="text-[8px] bg-white text-black font-extrabold px-1.5 py-0">
                            seu bot
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
