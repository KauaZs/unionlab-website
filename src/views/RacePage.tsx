"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Flame, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface Player {
  id: string;
  username: string;
  avatar: string | null;
  ready: boolean;
  position: number;
}

interface RaceData {
  id: string;
  playerA: Player;
  playerB: Player;
  bet: number;
  status: "pending" | "accepted" | "active" | "completed" | "cancelled" | "expired";
  winnerId?: string;
}

interface RacePageProps {
  raceId: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  } | null;
  onUpdateUser: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function RacePage({ raceId, user, onUpdateUser, showToast }: RacePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [race, setRace] = useState<RaceData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const fetchRaceData = () => {
    fetch(`/api/public/races/${raceId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Corrida não encontrada");
        return res.json();
      })
      .then((data) => {
        setRace(data as RaceData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // Poll status every 600ms while race is pending, accepted, or active
  useEffect(() => {
    fetchRaceData();
    const interval = setInterval(() => {
      if (race?.status === "completed" || race?.status === "cancelled") {
        clearInterval(interval);
        return;
      }
      fetchRaceData();
    }, 600);

    return () => clearInterval(interval);
  }, [raceId, race?.status]);

  const handleAccept = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    fetch(`/api/public/races/${raceId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao aceitar corrida");
        return data;
      })
      .then(() => {
        showToast("Você aceitou o desafio! Prepare-se para correr.", "success");
        onUpdateUser();
        fetchRaceData();
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao aceitar corrida.", "error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleCancel = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    fetch(`/api/public/races/${raceId}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao recusar corrida");
        return data;
      })
      .then(() => {
        showToast("Desafio de corrida cancelado/recusado.", "info");
        fetchRaceData();
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao recusar corrida.", "error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleReady = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    fetch(`/api/public/races/${raceId}/ready`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao alterar estado de pronto");
        return data;
      })
      .then(() => {
        fetchRaceData();
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao alterar estado de pronto.", "error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleAccelerate = () => {
    if (cooldown) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`/api/public/races/${raceId}/accelerate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 429) {
          setCooldown(true);
          setTimeout(() => setCooldown(false), 300);
          return;
        }
        if (!res.ok) throw new Error(data.error || "Erro ao acelerar");
        return data;
      })
      .then((data) => {
        if (data) {
          setRace((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              playerA: { ...prev.playerA, position: data.playerAPosition },
              playerB: { ...prev.playerB, position: data.playerBPosition },
              status: data.status,
              winnerId: data.winnerId,
            };
          });
          if (data.status === "completed") {
            onUpdateUser();
            showToast("A corrida terminou!", "info");
          }
        }
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao acelerar.", "error");
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

  if (!race) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Corrida Não Encontrada</h2>
        <p className="text-slate-400 text-xs">Esta sala de corrida expirou ou o ID fornecido é inválido.</p>
        <Button onClick={() => router.push("/")} variant="outline" className="w-full">
          Voltar para Home
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-16 h-16 rounded-full bg-zinc-950 border border-slate-900 flex items-center justify-center mx-auto shadow-md">
          <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Autenticação Necessária</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Você precisa estar conectado com a sua conta do Discord para participar ou assistir a este duelo de velocidade valendo Unicoins.
          </p>
        </div>
        <Button
          onClick={() => {
            localStorage.setItem("redirect_target", window.location.hash);
            window.location.href = "/api/auth/login";
          }}
          variant="premium"
          className="w-full h-10 font-bold text-xs"
        >
          Entrar com o Discord
        </Button>
        <Button onClick={() => router.push("/")} variant="outline" className="w-full h-10 font-bold text-xs">
          Voltar para a Home
        </Button>
      </div>
    );
  }

  const isPlayer = user && (user.id === race.playerA.id || user.id === race.playerB.id);
  const myPlayer = user.id === race.playerA.id ? race.playerA : user.id === race.playerB.id ? race.playerB : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xl mx-auto">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-md">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Duelo de Velocidade
        </h1>
        <p className="text-slate-400 text-sm">
          Apostando <span className="text-amber-400 font-extrabold">{race.bet} unicoins</span> de pote acumulado!
        </p>
      </div>

      {/* VIEW: PENDING */}
      {race.status === "pending" && (
        <Card className="border border-slate-900 bg-slate-950/10">
          <CardHeader className="text-center p-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-200">Desafio Pendente</CardTitle>
            <CardDescription className="text-xs">
              Aguardando o oponente aceitar os termos da aposta.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-6">
            <div className="flex items-center justify-center gap-12">
              {/* Player A */}
              <div className="space-y-2 text-center">
                <img
                  src={getAvatarUrl(race.playerA.id, race.playerA.avatar)}
                  alt={race.playerA.username}
                  className="w-16 h-16 rounded-full border border-slate-900 object-cover mx-auto"
                />
                <span className="text-xs font-bold text-slate-200 block">{race.playerA.username}</span>
                <Badge variant="default" className="bg-zinc-900 text-zinc-400 text-[9px] font-bold">Desafiante</Badge>
              </div>

              <div className="text-2xl font-black text-slate-700">VS</div>

              {/* Player B */}
              <div className="space-y-2 text-center">
                <img
                  src={getAvatarUrl(race.playerB.id, race.playerB.avatar)}
                  alt={race.playerB.username}
                  className="w-16 h-16 rounded-full border border-slate-900 object-cover mx-auto"
                />
                <span className="text-xs font-bold text-slate-200 block">{race.playerB.username}</span>
                <Badge variant="default" className="bg-zinc-900 text-zinc-400 text-[9px] font-bold">Desafiado</Badge>
              </div>
            </div>

            {/* Actions */}
            {user?.id === race.playerB.id ? (
              <div className="flex gap-4 max-w-sm mx-auto pt-4">
                <Button onClick={handleAccept} disabled={submitting} variant="premium" className="w-1/2 font-extrabold text-xs">
                  Aceitar Aposta
                </Button>
                <Button onClick={handleCancel} disabled={submitting} variant="destructive" className="w-1/2 font-extrabold text-xs">
                  Recusar
                </Button>
              </div>
            ) : user?.id === race.playerA.id ? (
              <div className="space-y-3 max-w-sm mx-auto pt-4">
                <p className="text-xs text-slate-500 font-medium">Aguardando {race.playerB.username} aceitar o desafio no site...</p>
                <Button onClick={handleCancel} disabled={submitting} variant="outline" className="w-full text-xs font-bold h-9">
                  Cancelar Desafio
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 pt-4 font-medium">Você é um espectador. Aguardando aceitação do desafio...</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* VIEW: ACCEPTED (Lobby/Ready phase) */}
      {race.status === "accepted" && (
        <Card className="border border-slate-900 bg-slate-950/10">
          <CardHeader className="text-center p-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-200">Sala de Espera</CardTitle>
            <CardDescription className="text-xs">
              Ambos os jogadores devem marcar "Pronto" para iniciar a corrida.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-8">
            <div className="flex items-center justify-center gap-16">
              {/* Player A */}
              <div className="space-y-3 text-center">
                <img
                  src={getAvatarUrl(race.playerA.id, race.playerA.avatar)}
                  alt={race.playerA.username}
                  className="w-16 h-16 rounded-full border border-slate-900 object-cover mx-auto"
                />
                <span className="text-xs font-bold text-slate-200 block">{race.playerA.username}</span>
                {race.playerA.ready ? (
                  <Badge variant="success">PRONTO</Badge>
                ) : (
                  <Badge variant="default" className="bg-zinc-900 text-zinc-500 border-zinc-800">AGUARDANDO</Badge>
                )}
              </div>

              {/* Player B */}
              <div className="space-y-3 text-center">
                <img
                  src={getAvatarUrl(race.playerB.id, race.playerB.avatar)}
                  alt={race.playerB.username}
                  className="w-16 h-16 rounded-full border border-slate-900 object-cover mx-auto"
                />
                <span className="text-xs font-bold text-slate-200 block">{race.playerB.username}</span>
                {race.playerB.ready ? (
                  <Badge variant="success">PRONTO</Badge>
                ) : (
                  <Badge variant="default" className="bg-zinc-900 text-zinc-500 border-zinc-800">AGUARDANDO</Badge>
                )}
              </div>
            </div>

            {/* Toggle Ready button */}
            {isPlayer ? (
              <div className="max-w-xs mx-auto pt-4">
                <Button
                  onClick={handleReady}
                  disabled={submitting}
                  variant={myPlayer?.ready ? "outline" : "premium"}
                  className="w-full text-xs font-extrabold h-10"
                >
                  {myPlayer?.ready ? "Cancelar Pronto" : "Ficar Pronto 🏎️"}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 pt-4 font-medium">Aguardando os competidores se prepararem...</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* VIEW: ACTIVE (The actual Race game!) */}
      {race.status === "active" && (
        <div className="space-y-8">
          <Card className="border border-slate-900 bg-slate-950/10 overflow-hidden">
            <CardContent className="p-8 space-y-8">
              
              {/* Race Track Container */}
              <div className="space-y-6 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 relative">
                
                {/* Lane 1: Player A */}
                <div className="relative h-12 flex items-center border-b border-dashed border-slate-900/60 pb-3">
                  <div className="absolute left-0 text-[10px] font-bold text-slate-500 tracking-wider">LANE 1</div>
                  <div
                    className="absolute h-10 flex items-center transition-all duration-200"
                    style={{ left: `calc(${race.playerA.position}% - 24px)`, marginLeft: '40px', width: '32px' }}
                  >
                    <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]">🏎️</span>
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-red-400 bg-slate-950 border border-red-500/10 px-1 py-0 rounded">
                      {race.playerA.username.split(" ")[0]}
                    </span>
                  </div>
                  <div className="absolute right-0 text-slate-700 font-extrabold text-sm select-none pr-2">🏁</div>
                </div>

                {/* Lane 2: Player B */}
                <div className="relative h-12 flex items-center pt-3">
                  <div className="absolute left-0 text-[10px] font-bold text-slate-500 tracking-wider">LANE 2</div>
                  <div
                    className="absolute h-10 flex items-center transition-all duration-200"
                    style={{ left: `calc(${race.playerB.position}% - 24px)`, marginLeft: '40px', width: '32px' }}
                  >
                    <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)]">🏎️</span>
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-amber-400 bg-slate-950 border border-amber-500/10 px-1 py-0 rounded">
                      {race.playerB.username.split(" ")[0]}
                    </span>
                  </div>
                  <div className="absolute right-0 text-slate-700 font-extrabold text-sm select-none pr-2">🏁</div>
                </div>

              </div>

              {/* User game controls */}
              {isPlayer ? (
                <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                  <button
                    onClick={handleAccelerate}
                    disabled={cooldown}
                    className={`w-40 h-40 rounded-full border-4 border-slate-950 bg-gradient-to-br from-amber-500 to-orange-600 text-black font-black text-sm uppercase tracking-wider shadow-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-100 ${
                      cooldown ? "opacity-50 scale-95" : "hover:scale-105 active:scale-95"
                    }`}
                  >
                    <Flame className="w-7 h-7 fill-black animate-pulse" />
                    <span>ACELERAR!</span>
                  </button>

                  {cooldown && (
                    <span className="text-xs text-red-500 font-bold flex items-center gap-1 animate-bounce">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Acelerando muito rápido! Espere o motor esfriar...
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-semibold leading-normal">
                  Você está assistindo ao duelo ao vivo! Os competidores estão acelerando seus carros.
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW: COMPLETED */}
      {race.status === "completed" && (
        <Card className="border border-slate-900 bg-slate-950/10">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Corrida Concluída!</h2>
              <p className="text-xs text-slate-400">
                O grande vencedor faturou a bolada acumulada de <span className="text-amber-400 font-extrabold">{race.bet * 2} unicoins</span>!
              </p>
            </div>

            {/* Winner Details Card */}
            <div className="bg-zinc-950 border border-slate-900 rounded-2xl p-6 max-w-sm mx-auto space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Grande Campeão</span>
              {race.winnerId === race.playerA.id ? (
                <div className="space-y-2">
                  <img
                    src={getAvatarUrl(race.playerA.id, race.playerA.avatar)}
                    alt={race.playerA.username}
                    className="w-14 h-14 rounded-full border border-slate-900 object-cover mx-auto ring-4 ring-amber-500/20"
                  />
                  <span className="text-sm font-black text-white block">{race.playerA.username}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <img
                    src={getAvatarUrl(race.playerB.id, race.playerB.avatar)}
                    alt={race.playerB.username}
                    className="w-14 h-14 rounded-full border border-slate-900 object-cover mx-auto ring-4 ring-amber-500/20"
                  />
                  <span className="text-sm font-black text-white block">{race.playerB.username}</span>
                </div>
              )}
            </div>

            <div className="pt-4 max-w-xs mx-auto">
              <Button onClick={() => router.push("/")} variant="outline" className="w-full text-xs font-bold h-9">
                Voltar para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW: CANCELLED / EXPIRED */}
      {(race.status === "cancelled" || race.status === "expired") && (
        <Card className="border border-slate-900 bg-slate-950/10">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-200 font-sans">
              {race.status === "expired" ? "Desafio Expirado" : "Desafio Cancelado"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
              {race.status === "expired"
                ? "Este convite de desafio expirou após o tempo limite de 5 minutos sem ser aceito."
                : "Esta corrida foi recusada pelo oponente ou cancelada por um dos participantes. Nenhuma Unicoin foi debitada."}
            </p>
            <div className="pt-4 max-w-xs mx-auto">
              <Button onClick={() => router.push("/")} variant="outline" className="w-full text-xs font-bold h-9">
                Voltar para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
